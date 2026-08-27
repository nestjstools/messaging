import { Injectable } from '@nestjs/common';
import { IMessageBus, RoutingMessage } from '@nestjstools/messaging';
import { PostgresChannel } from '../channel/postgres.channel';
import { PostgresMessageEnvelope } from '../message/postgres-message-envelope';
import { PostgresMessageOptions } from '../message/postgres-message-options';

@Injectable()
export class PostgresMessageBus implements IMessageBus {
  constructor(private readonly channel: PostgresChannel) {}

  async dispatch(message: RoutingMessage): Promise<void> {
    if (
      message.messageOptions !== undefined &&
      !(message.messageOptions instanceof PostgresMessageOptions)
    ) {
      throw new Error(
        `Message options must be a ${PostgresMessageOptions.name} object`,
      );
    }

    await this.channel.start();

    const options = message.messageOptions as
      | PostgresMessageOptions
      | undefined;
    const queue = options?.queue ?? this.channel.config.queue;
    await this.channel.ensureQueue(queue);
    if (options?.sendOptions.deadLetter) {
      await this.channel.ensureQueue(options.sendOptions.deadLetter);
    }
    const payload: PostgresMessageEnvelope = {
      payload: message.message,
      routingKey: message.messageRoutingKey,
    };

    await this.channel.boss.send(queue, payload, {
      ...this.channel.config.queuePolicy,
      ...options?.sendOptions,
    });
  }
}
