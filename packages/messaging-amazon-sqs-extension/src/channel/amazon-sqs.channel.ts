import { Channel } from '@nestjstools/messaging';
import { AmazonSqsChannelConfig } from './amazon-sqs.channel-config';
import { CreateQueueCommand, SQSClient } from '@aws-sdk/client-sqs';

export class AmazonSqsChannel extends Channel<AmazonSqsChannelConfig> {
  public readonly client: SQSClient;

  constructor(config: AmazonSqsChannelConfig) {
    super(config);
    this.client = new SQSClient({
      endpoint: config.endpoint,
      region: config.region,
      credentials: config.credentials,
    });

    if (!config.autoCreate) {
      return;
    }

    this.client.send(
      new CreateQueueCommand({
        QueueName: config.queueName,
      }),
    );
  }

  async onChannelDestroy(): Promise<void> {
    this.client.destroy();
    return super.onChannelDestroy();
  }
}
