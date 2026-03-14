import { ChannelConfig } from '@nestjstools/messaging';

export class RmqChannelConfig extends ChannelConfig {
  /**
   * @description Connection URI for RabbitMQ server
   */
  public readonly connectionUri: string;

  /**
   * @description Name of the RabbitMQ exchange
   */
  public readonly exchangeName: string;

  /**
   * @description Type of the RabbitMQ exchange (topic, fanout, direct)
   */
  public readonly exchangeType: ExchangeType;

  /**
   * @description Name of the queue to bind to the exchange
   */
  public readonly queue: string;

  /**
   * @description Routing keys used to bind the queue to the exchange
   */
  public readonly bindingKeys?: string[];

  /**
   * @description Whether to automatically create exchange and queue if they don't exist
   */
  public readonly autoCreate?: boolean;

  /**
   * @description Enable dead letter queue functionality for failed messages
   */
  public readonly deadLetterQueueFeature?: boolean;

  /**
   * @description Number of times to retry a message before sending it to the dead letter queue. Only applicable if `deadLetterQueueFeature` is enabled.
   */
  public readonly retryMessage?: number;

  /**
   * @description Time to live for retry messages in milliseconds. After this time, messages will be moved from the retry queue back to the main exchange for reprocessing. Only applicable if `retryMessage` is set. Default is 1000 ms.
   */
  public readonly retryMessageTtl?: number;

  /**
   * @description Whether to forcefully recreate the retry queue on application startup. This can be useful during development to ensure a clean state, but should be used with caution in production environments as it will delete all messages in the retry queue.
   */
  public readonly forceRecreateRetryQueue?: boolean;

  /**
   * @description Prefetch count for the channel, which limits the number of unacknowledged messages that can be sent to the consumer at a time. This can help improve performance and prevent overwhelming the consumer with too many messages. Default is 1.
   */
  public readonly qos?: number;

  constructor({
    name,
    connectionUri,
    exchangeName,
    exchangeType,
    queue,
    enableConsumer,
    bindingKeys,
    autoCreate,
    deadLetterQueueFeature,
    avoidErrorsForNotExistedHandlers,
    middlewares,
    normalizer,
    retryMessage,
    retryMessageTtl,
    forceRecreateRetryQueue,
    qos,
  }: RmqChannelConfig) {
    super(
      name,
      avoidErrorsForNotExistedHandlers,
      middlewares,
      enableConsumer,
      normalizer,
    );
    this.connectionUri = connectionUri;
    this.exchangeName = exchangeName;
    this.exchangeType = exchangeType;
    this.queue = queue;
    this.bindingKeys = bindingKeys;
    this.autoCreate = autoCreate ?? true;
    this.deadLetterQueueFeature = deadLetterQueueFeature ?? false;
    this.retryMessage = retryMessage;
    this.retryMessageTtl = retryMessageTtl;
    this.forceRecreateRetryQueue = forceRecreateRetryQueue;
    this.qos = qos ?? 1;
  }
}

export enum ExchangeType {
  TOPIC = 'topic',
  FANOUT = 'fanout',
  DIRECT = 'direct',
}
