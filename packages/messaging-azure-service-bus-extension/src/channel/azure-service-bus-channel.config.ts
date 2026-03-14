import { ChannelConfig } from '@nestjstools/messaging';

export class AzureServiceBusChannelConfig extends ChannelConfig {
  public readonly mode?: Mode;
  public readonly queue?: string;
  public readonly topic?: string;
  public readonly subscription?: string;
  public readonly connectionString: string;
  public readonly autoCreate?: boolean;

  constructor({
    name,
    queue,
    mode,
    topic,
    subscription,
    connectionString,
    autoCreate,
    enableConsumer,
    avoidErrorsForNotExistedHandlers,
    middlewares,
    normalizer,
  }: AzureServiceBusChannelConfig) {
    super(
      name,
      avoidErrorsForNotExistedHandlers,
      middlewares,
      enableConsumer,
      normalizer,
    );
    this.queue = queue;
    this.connectionString = connectionString;
    this.queue = queue;
    this.mode = mode ?? Mode.QUEUE;
    this.topic = topic;
    this.subscription = subscription;
    this.autoCreate = autoCreate ?? false;
  }
}

export enum Mode {
  QUEUE = 'queue',
  TOPIC = 'topic',
}
