import { ChannelConfig } from '@nestjstools/messaging';
import { JobsOptions } from 'bullmq';

export class RedisChannelConfig extends ChannelConfig {
  public readonly connection: Connection;
  public readonly queue: string;
  /**
   * @description
   * This prefix is not used as RedisOptions keyPrefix, it is used as prefix for BullMQ
   * Read more: https://github.com/taskforcesh/bullmq/issues/1219#issuecomment-1113903785
   */
  public readonly keyPrefix?: string;
  /**
   * Default BullMQ options for every message sent through this channel.
   * Set `attempts` and `backoff` here to enable retry delivery.
   */
  public readonly bullJobOptions?: JobsOptions;

  constructor({
    name,
    connection,
    queue,
    enableConsumer,
    avoidErrorsForNotExistedHandlers,
    middlewares,
    normalizer,
    keyPrefix,
    bullJobOptions,
  }: RedisChannelConfig) {
    super(
      name,
      avoidErrorsForNotExistedHandlers,
      middlewares,
      enableConsumer,
      normalizer,
    );
    if (!name?.trim()) {
      throw new Error('Redis channel name is required');
    }

    if (!queue?.trim()) {
      throw new Error('Redis queue is required');
    }

    if (!connection?.host?.trim() || !Number.isInteger(connection.port)) {
      throw new Error('Redis connection host and integer port are required');
    }

    this.connection = connection;
    this.queue = queue;
    this.keyPrefix = keyPrefix;
    this.bullJobOptions = bullJobOptions;
  }
}

interface Connection {
  host: string;
  port: number;
  password?: string;
  db?: number;
}
