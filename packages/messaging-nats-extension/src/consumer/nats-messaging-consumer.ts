import { NatsChannel } from '../channel/nats.channel.js';
import {
  ConsumerMessage,
  IMessagingConsumer,
  MessageConsumer,
  ConsumerDispatchedMessageError,
  ConsumerMessageBus,
} from '@nestjstools/messaging';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { NatsConnection } from '@nats-io/nats-core';

@Injectable()
@MessageConsumer(NatsChannel)
export class NatsMessagingConsumer
  implements IMessagingConsumer<NatsChannel>, OnApplicationShutdown
{
  private channel?: NatsChannel = undefined;
  private client?: NatsConnection = undefined;

  async consume(
    dispatcher: ConsumerMessageBus,
    channel: NatsChannel,
  ): Promise<void> {
    this.channel = channel;
    this.client = await this.channel.client;

    await this.client.subscribe(channel.config.subscriberName, {
      callback: (err, msg) => {
        if (err) {
          throw new Error(`Nats error ${err.message}`);
        }

        const headers = msg.headers ?? undefined;

        const deserialized = JSON.parse(msg.string());
        dispatcher.dispatch(
          new ConsumerMessage(
            deserialized,
            headers?.get('messaging-routing-key') ?? msg.subject,
          ),
        );
      },
    });

    return Promise.resolve();
  }

  async onError(
    errored: ConsumerDispatchedMessageError,
    channel: NatsChannel,
  ): Promise<void> {
    return Promise.resolve();
  }

  async onApplicationShutdown(signal?: string): Promise<any> {
    if (this.client) {
      await this.client.drain();
      await this.client.close();
    }
  }
}
