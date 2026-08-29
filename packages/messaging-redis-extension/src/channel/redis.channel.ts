import { Channel } from '@nestjstools/messaging';
import { RedisChannelConfig } from './redis.channel-config.js';
import { Queue } from 'bullmq';

export class RedisChannel extends Channel<RedisChannelConfig> {
  public readonly queue: Queue;

  constructor(config: RedisChannelConfig) {
    super(config);
    this.queue = new Queue(config.queue, {
      connection: this.config.connection,
      prefix: config.keyPrefix,
      defaultJobOptions: {
        ...config.bullJobOptions,
      },
    });
  }
}
