import { MessageAttributeValue } from '@aws-sdk/client-sqs/dist-types/models/models_0';

export class AmazonSqsMessageOptions {
  constructor(
    public readonly attributes: Record<string, MessageAttributeValue> = {},
  ) {}
}
