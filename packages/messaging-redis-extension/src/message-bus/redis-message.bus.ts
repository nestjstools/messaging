import { RoutingMessage } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { RedisChannel } from '../channel/redis.channel.js';
import { RedisMessageOptions } from '../message/redis-message-options.js';

@Injectable()
export class RedisMessageBus implements IMessageBus {
  constructor(private readonly redisChannel: RedisChannel) {}

  async dispatch(message: RoutingMessage): Promise<void> {
    const messageOptions = message.messageOptions;

    if (
      messageOptions !== undefined &&
      !(messageOptions instanceof RedisMessageOptions)
    ) {
      throw new Error(
        `Message options must be a ${RedisMessageOptions.name} object`,
      );
    }

    const jobOptions =
      messageOptions instanceof RedisMessageOptions
        ? messageOptions.jobOptions
        : undefined;

    await this.redisChannel.queue.add(
      message.messageRoutingKey,
      message.message,
      jobOptions,
    );
  }
}
