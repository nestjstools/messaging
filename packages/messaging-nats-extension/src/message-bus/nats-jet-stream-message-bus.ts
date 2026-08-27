import { RoutingMessage } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { headers } from '@nats-io/nats-core';
import { NatsJetStreamChannel } from '../channel/nats-jet-stream.channel';
import { NatsJetStreamMessageOptions } from '../message/nats-jet-stream-message-options';

@Injectable()
export class NatsJetStreamMessageBus implements IMessageBus {
  constructor(private readonly channel: NatsJetStreamChannel) {}

  async dispatch(message: RoutingMessage): Promise<object | void> {
    const messageOptions = message.messageOptions;

    if (
      messageOptions !== undefined &&
      !(messageOptions instanceof NatsJetStreamMessageOptions)
    ) {
      throw new Error(
        `Message options must be a ${NatsJetStreamMessageOptions.name} object`,
      );
    }

    const js = await this.channel.jetStreamClient();

    let routingKey = this.channel.config.consumerConfig.subject;
    const h = headers();

    if (
      this.channel.config.consumerConfig.subject.includes('>') ||
      this.channel.config.consumerConfig.subject.includes('*')
    ) {
      routingKey = message.messageRoutingKey;
    }

    if (messageOptions instanceof NatsJetStreamMessageOptions) {
      for (const [key, value] of Object.entries(messageOptions.headers)) {
        h.set(key, value);
      }
    }

    h.set('messaging-routing-key', message.messageRoutingKey);

    js.publish(routingKey, JSON.stringify(message.message), {
      headers: h,
      ...(messageOptions?.ttl !== undefined ? { ttl: messageOptions.ttl } : {}),
      ...(messageOptions?.retries !== undefined
        ? { retries: messageOptions.retries }
        : {}),
      ...(messageOptions?.schedule !== undefined
        ? { schedule: messageOptions.schedule }
        : {}),
      ...(messageOptions?.timeout !== undefined
        ? { timeout: messageOptions.timeout }
        : {}),
    }).catch((err) => {});
  }
}
