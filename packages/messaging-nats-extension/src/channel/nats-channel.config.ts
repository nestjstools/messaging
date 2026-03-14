import { ChannelConfig } from '@nestjstools/messaging';

export class NatsChannelConfig extends ChannelConfig {
  public readonly connectionUris: string[];
  public readonly subscriberName: string;

  constructor({
    connectionUris,
    subscriberName,
    name,
    enableConsumer,
    avoidErrorsForNotExistedHandlers,
    middlewares,
    normalizer,
  }: NatsChannelConfig) {
    super(
      name,
      avoidErrorsForNotExistedHandlers,
      middlewares,
      enableConsumer,
      normalizer,
    );
    this.connectionUris =
      typeof connectionUris === 'string' ? [connectionUris] : connectionUris;
    this.subscriberName = subscriberName;
  }
}
