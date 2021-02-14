import { providers } from '../../resources/forwardings/model';

export default {
  type: "object",
  properties: {
    provider: { type: 'string', enum: providers },
    // TODO: add a URL validator
    callbackUrl: { type: 'string', pattern: '^https?://.*$' },
  },
  required: ['provider', 'callbackUrl']
} as const;
