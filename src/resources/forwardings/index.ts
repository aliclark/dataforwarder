export default {
  Type: 'AWS::DynamoDB::Table',
  Properties: {
    TableName: 'forwardings',
    // TODO: use ./data schema object to compute these
    AttributeDefinitions: [
      {
        AttributeName: 'provider',
        AttributeType: 'S'
      },
      {
        AttributeName: 'callbackUrl',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'provider',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'callbackUrl',
        KeyType: 'RANGE'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
}
