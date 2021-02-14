import 'source-map-support/register';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { Forwarding, ForwardingTable } from '../../resources/forwardings/model';

import schema from './schema';


const createForwarding: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { provider, callbackUrl }: Forwarding = event.body;
  await ForwardingTable.update({ provider, callbackUrl });
  return formatJSONResponse({ created: true }, 201);
}

export const main = middyfy(createForwarding);
