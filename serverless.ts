import type { AWS } from '@serverless/typescript';

import { createForwarding, runForwardings } from './src/functions';
import { forwardings } from './src/resources';

const serverlessConfiguration: AWS = {
  service: 'dataforwarder',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    dynamodb: {
      stages: ['dev'],
      inMemory: true
    },
    'serverless-offline': {
      httpPort: 3001
    },
    prune: {
      automatic: true,
      number: 3
    }
  },
  plugins: [
    'serverless-webpack',
    'serverless-dynamodb-local',
    'serverless-offline',
    'serverless-prune-plugin'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      LOG_LEVEL: 'debug',
      FORWARDING_TABLE_CREATE: '1',
      AWS_REGION: 'localhost',
      AWS_ACCESS_KEY_ID: 'DEFAULT_ACCESS_KEY',
      AWS_SECRET_ACCESS_KEY: 'DEFAULT_SECRET',
      AWS_DYNAMODB_ENDPOINT: 'http://localhost:8000',
      DATAHOG_URL: 'http://127.0.0.1:3000/providers/{provider}',
      // up to 4 connections (default) at a time, in case one or two connections are go slowly
      FORWARDING_MAX_CONCURRENT: '4',
      // up to 1 request per 10ms => 100/s (default) maximum load on downstream servers
      FORWARDING_MIN_TIME_MILLIS: '10',
      FORWARDING_PROVIDER_TTL_MILLIS: '8000',
      FORWARDING_HTTP_TIMEOUT_MILLIS: '4000',
      FORWARDING_CHECK_PERIOD_MILLIS: '10000'
    },
    lambdaHashingVersion: '20201221',
  },
  // TODO: use serverless-iam-roles-per-function
  functions: { createForwarding, runForwardings },
  resources: { Resources: { forwardings } }
}

module.exports = serverlessConfiguration;
