const dynamoose = require('dynamoose');


const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;

const create = !!process.env.FORWARDING_TABLE_CREATE;


dynamoose.aws.ddb.set(new dynamoose.aws.sdk.DynamoDB({
    accessKeyId,
    secretAccessKey,
    region,
    ...(process.env.AWS_DYNAMODB_ENDPOINT && { endpoint: process.env.AWS_DYNAMODB_ENDPOINT })
}));


export const providers = ['gas', 'internet'] as const;

export const schema = {
    provider: {
        type: String,
        enum: providers,
        required: true,
        hashKey: true
    },
    callbackUrl: {
        type: String,
        required: true,
        rangeKey: true
    }
};

export type Provider = typeof providers[number];

export interface Forwarding {
    provider: Provider,
    callbackUrl: string
};


export const ForwardingTable = dynamoose.model('forwarding', new dynamoose.Schema(schema, {
    timestamps: true
}), {
    create,
    waitForActive: false
});
