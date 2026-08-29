import { RoutingMessage } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { headers } from '@nats-io/nats-core';
import { NatsJetStreamChannel } from '../channel/nats-jet-stream.channel.js';
import { NatsJetStreamMessageOptions } from '../message/nats-jet-stream-message-options.js';

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
    const natsMessageOptions =
      messageOptions as NatsJetStreamMessageOptions | undefined;

    const js = await this.channel.jetStreamClient();

    let routingKey = this.channel.config.consumerConfig.subject;
    const h = headers();

    if (
      this.channel.config.consumerConfig.subject.includes('>') ||
      this.channel.config.consumerConfig.subject.includes('*')
    ) {
      routingKey = message.messageRoutingKey;
    }

    if (natsMessageOptions) {
      for (const [key, value] of Object.entries(natsMessageOptions.headers)) {
        h.set(key, value);
      }
    }

    h.set('messaging-routing-key', message.messageRoutingKey);

    js.publish(routingKey, JSON.stringify(message.message), {
      headers: h,
      ...(natsMessageOptions?.ttl !== undefined
        ? { ttl: natsMessageOptions.ttl }
        : {}),
      ...(natsMessageOptions?.retries !== undefined
        ? { retries: natsMessageOptions.retries }
        : {}),
      ...(natsMessageOptions?.schedule !== undefined
        ? { schedule: natsMessageOptions.schedule }
        : {}),
      ...(natsMessageOptions?.timeout !== undefined
        ? { timeout: natsMessageOptions.timeout }
        : {}),
    }).catch((err) => {});
  }
}
