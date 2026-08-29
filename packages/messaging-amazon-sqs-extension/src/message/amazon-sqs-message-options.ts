import type { MessageAttributeValue } from '@aws-sdk/client-sqs';

export class AmazonSqsMessageOptions {
  constructor(
    public readonly attributes: Record<string, MessageAttributeValue> = {},
  ) {}
}
