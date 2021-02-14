import 'source-map-support/register';

import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"

import Bottleneck from 'bottleneck';
import axios from 'axios';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { retry, withTimeout, delay } from '@libs/promise';
import { computeIfAbsent } from '@libs/computeIfAbsent';
import { logger } from '@libs/logger';

import { Provider, Forwarding, ForwardingTable } from '../../resources/forwardings/model';


const datahogUrl: string = process.env.DATAHOG_URL ?? '';

const maxConcurrent: number = parseInt(process.env.FORWARDING_MAX_CONCURRENT ?? '1', 10)

const minTime: number = parseInt(process.env.FORWARDING_MIN_TIME_MILLIS ?? '0', 10)

const forwardingHttpTimeoutMillis: number = parseInt(process.env.FORWARDING_HTTP_TIMEOUT_MILLIS ?? '0', 10)

const ttlMillis: number = parseInt(process.env.FORWARDING_PROVIDER_TTL_MILLIS ?? '0', 10)

const forwardingCheckPeriodMillis: number = parseInt(process.env.FORWARDING_CHECK_PERIOD_MILLIS ?? '0', 10)


const limiter = new Bottleneck({ maxConcurrent, minTime });


const getProvider = computeIfAbsent((provider: Provider) => {

    const providerUrl: string = datahogUrl.replace(/{provider}/g, encodeURIComponent(provider));

    return retry(attempt => {
        logger.debug(`Requesting ${provider} attempt ${attempt}`)
        return withTimeout(axios.get(providerUrl).then(({ data }) => data), forwardingHttpTimeoutMillis)
    });

}, ttlMillis);


const runSingleForwarding = limiter.wrap(async({ provider, callbackUrl }: Forwarding) => {

    const data = await getProvider(provider);

    await retry(attempt => {
        logger.debug(`Sending ${provider} to ${callbackUrl} attempt ${attempt}`)
        return withTimeout(axios.post(callbackUrl, data), forwardingHttpTimeoutMillis)
    });

    await ForwardingTable.delete({ provider, callbackUrl });
});


// TODO: consider switching to a queue design using single-shard Kinesis
const runForwardings: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (_, context) => {

    let stopping: Promise<void> | undefined;

    setTimeout(async() => {
        stopping = limiter.stop();
        // nb. at time of writing there was a bug in serverless-offline
        // causing getRemainingTimeInMillis() to be multiplied by an extra 1000.
        // This will cause the timeout to not trigger at the right point locally.
    }, context.getRemainingTimeInMillis() - forwardingCheckPeriodMillis);

    while (!stopping) {

        const forwardings: Forwarding[] = await ForwardingTable.scan().all().exec();
        forwardings.forEach(forwarding => logger.info(`Forwarding ${JSON.stringify(forwarding)}`))

        if (stopping) {
            break;
        }

        const results: PromiseSettledResult<void>[] = await Promise.allSettled(forwardings.map(runSingleForwarding))
        logger.info(results.map(x => x.status));

        if (stopping) {
            break;
        }

        logger.info(`Waiting ${forwardingCheckPeriodMillis / 1000} seconds`);
        await delay(forwardingCheckPeriodMillis);
    }

    await stopping;

    return formatJSONResponse({ completed: true });
}


export const main = middyfy(runForwardings);
