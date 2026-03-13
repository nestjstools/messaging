import { RoutingMessage } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { RedisChannel } from '../channel/redis.channel';

@Injectable()
export class RedisMessageBus implements IMessageBus {
  constructor(private readonly redisChannel: RedisChannel) {}

  async dispatch(message: RoutingMessage): Promise<void> {
    await this.redisChannel.queue.add(
      message.messageRoutingKey,
      message.message,
    );
  }
}
