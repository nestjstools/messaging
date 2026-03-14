import { MessageOptions } from '@nestjstools/messaging';
import { MessageAttributeValue } from '@aws-sdk/client-sqs/dist-types/models/models_0';

export class AmazonSqsMessageOptions implements MessageOptions {
  public readonly middlewares: any[] = [];
  public readonly avoidErrorsWhenNotExistedHandler: boolean = false;

  constructor(
    public readonly attributes: Record<string, MessageAttributeValue> = {},
  ) {}
}
