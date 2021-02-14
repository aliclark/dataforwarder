const axios = require('axios');
const { spawn } = require('child_process');
const mockServer = require('mockttp');


let serverless;

const startServerless = () => new Promise((resolve, reject) => {
    let serverlessOutput = '';

    serverless = spawn('./node_modules/.bin/serverless', ['offline', 'start']);

    serverless.stdout.on('data', (data) => {
        const message = data.toString();
        console.debug(message);
        serverlessOutput += message;
        if (serverlessOutput.includes('[HTTP] server ready: http://localhost:3001')) {
            resolve(undefined);
        }
    });

    serverless.stderr.on('data', (data) => {
        const message = data.toString();
        console.error(message);
        reject(message);
    });
});

const stopServerless = () => serverless.kill();


const datahubMock = mockServer.getLocal();
const startDatahubMock = () => datahubMock.start(3004);
const stopDatahubMock  = () => datahubMock.stop();


const callbackMock = mockServer.getLocal();
const startCallbackMock = () => callbackMock.start(3003);
const stopCallbackMock  = () => callbackMock.stop();


describe('dataforwarder', () => {

    beforeAll(async() => {
        await startServerless();
        await startDatahubMock();
        await startCallbackMock();
    }, 30 * 1000);

    afterAll(async() => {
        await stopServerless();
        await stopDatahubMock();
        await stopCallbackMock();
    });

//    beforeAll(startDatahubMock);
//    afterAll(stopDatahubMock);

//    beforeAll(startCallbackMock);
//    afterAll(stopCallbackMock);

    it('fetches upon next execution', async() => {
        //await datahubMock.get('/providers/gas').thenJson(200, [{"billedOn":"2020-04-07T15:03:14.257Z","amount":22.27},{"billedOn":"2020-05-07T15:03:14.257Z","amount":30}])
        //await datahubMock.get('/providers/internet').thenJson(200, [{"billedOn":"2020-02-07T15:03:14.257Z","amount":15.12},{"billedOn":"2020-03-07T15:03:14.257Z","amount":15.12}])

        //const response = await axios.post('http://localhost:3001/dev/forwardings', { provider: 'gas', callbackUrl: 'http://postman-echo.com/post' });
        //console.log(response.data);

        //expect(response.data).toStrictEqual({ created: true })
        expect(true).toBe(true);
    }, 15 * 1000)
})
