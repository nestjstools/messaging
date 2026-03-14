import { RoutingMessage } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { NatsChannel } from '../channel/nats.channel';
import { headers } from 'nats';

@Injectable()
export class NatsMessageBus implements IMessageBus {
  constructor(private readonly channel: NatsChannel) {}

  async dispatch(message: RoutingMessage): Promise<object | void> {
    const client = await this.channel.client;
    let routingKey = this.channel.config.subscriberName;
    const h = headers();

    if (
      this.channel.config.subscriberName.includes('>') ||
      this.channel.config.subscriberName.includes('*')
    ) {
      routingKey = message.messageRoutingKey;
    }

    h.set('messaging-routing-key', message.messageRoutingKey);

    client.publish(routingKey, JSON.stringify(message.message), { headers: h });
  }
}
