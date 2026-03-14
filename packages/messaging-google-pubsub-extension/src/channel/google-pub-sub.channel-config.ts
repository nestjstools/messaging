import { ChannelConfig } from '@nestjstools/messaging';

export class GooglePubSubChannelConfig extends ChannelConfig {
  public readonly credentials?: Credentials;
  public readonly topicName: string;
  public readonly subscriptionName: string;
  public readonly autoCreate?: boolean;

  constructor({
    name,
    credentials,
    topicName,
    subscriptionName,
    autoCreate,
    enableConsumer,
    avoidErrorsForNotExistedHandlers,
    middlewares,
    normalizer,
  }: GooglePubSubChannelConfig) {
    super(
      name,
      avoidErrorsForNotExistedHandlers,
      middlewares,
      enableConsumer,
      normalizer,
    );
    this.credentials = credentials;
    this.topicName = topicName;
    this.subscriptionName = subscriptionName;
    this.autoCreate = autoCreate ?? true;
  }
}

interface Credentials {
  projectId: string;
}
