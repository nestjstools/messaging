import { RoutingMessage } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { NatsChannel } from '../channel/nats.channel';
import { headers } from '@nats-io/nats-core';
import { NatsMessageOptions } from '../message/nats-message-options';

@Injectable()
export class NatsMessageBus implements IMessageBus {
  constructor(private readonly channel: NatsChannel) {}

  async dispatch(message: RoutingMessage): Promise<object | void> {
    const messageOptions = message.messageOptions;

    if (
      messageOptions !== undefined &&
      !(messageOptions instanceof NatsMessageOptions)
    ) {
      throw new Error(
        `Message options must be a ${NatsMessageOptions.name} object`,
      );
    }

    const client = await this.channel.client;
    let routingKey = this.channel.config.subscriberName;
    const h = headers();

    if (
      this.channel.config.subscriberName.includes('>') ||
      this.channel.config.subscriberName.includes('*')
    ) {
      routingKey = message.messageRoutingKey;
    }

    if (messageOptions instanceof NatsMessageOptions) {
      for (const [key, value] of Object.entries(messageOptions.headers)) {
        h.set(key, value);
      }
    }

    h.set('messaging-routing-key', message.messageRoutingKey);

    client.publish(routingKey, JSON.stringify(message.message), { headers: h });
  }
}
