import { Promise } from 'bluebird';
const promiseRetry = require('promise-retry');


export const retry = <T>(fn: (attempt: number) => Promise<T>, retries: number = 3): Promise<T> =>
    promiseRetry((reattempt: () => Promise<T>, attempt: number) => fn(attempt).catch(reattempt), { retries, randomize: true });


    // Using a clock timer for HTTP has the benefit of including both connection and data timeouts
// and is based on total time not idle time during the request.
// A drawback is that requests will not be aborted even after they are timed-out.
export const withTimeout = <T>(promise: Promise<T>, timeoutMillis: number): Promise<T> =>
    Promise.resolve(promise).timeout(timeoutMillis);

export const delay = (timeoutMillis: number): Promise<void> => Promise.delay(timeoutMillis)
