import {
  ConsumerMessage,
  IMessagingConsumer,
  ConsumerMessageBus,
  MessageConsumer,
  ConsumerDispatchedMessageError,
} from '@nestjstools/messaging';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisChannel } from '../channel/redis.channel.js';
import { Worker } from 'bullmq';

@Injectable()
@MessageConsumer(RedisChannel)
export class RedisMessagingConsumer
  implements IMessagingConsumer<RedisChannel>, OnModuleDestroy
{
  private channel?: RedisChannel = undefined;
  private worker?: Worker = undefined;

  async consume(
    dispatcher: ConsumerMessageBus,
    channel: RedisChannel,
  ): Promise<void> {
    this.channel = channel;

    this.worker = new Worker(
      channel.config.queue,
      async (job) => {
        await dispatcher.dispatch(new ConsumerMessage(job.data, job.name));
      },
      {
        connection: this.channel.config.connection,
        prefix: channel.config.keyPrefix,
      },
    );

    return Promise.resolve();
  }

  onError(
    errored: ConsumerDispatchedMessageError,
    channel: RedisChannel,
  ): Promise<void> {
    void channel;
    // ConsumerMessageBus handles the error for logging and lifecycle hooks, but
    // resolves afterwards. Rethrowing here makes the BullMQ processor fail so
    // its configured attempts, backoff, and failed-job handling are applied.
    return Promise.reject(errored.error);
  }

  async onModuleDestroy(): Promise<any> {
    if (this.channel) {
      await this.worker?.close();
      await this.channel.queue.close();
    }
  }
}
