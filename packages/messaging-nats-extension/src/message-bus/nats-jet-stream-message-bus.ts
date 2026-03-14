import { RoutingMessage } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { headers } from 'nats';
import { NatsJetStreamChannel } from '../channel/nats-jet-stream.channel';

@Injectable()
export class NatsJetStreamMessageBus implements IMessageBus {
  constructor(private readonly channel: NatsJetStreamChannel) {}

  async dispatch(message: RoutingMessage): Promise<object | void> {
    const js = await this.channel.jetStreamClient();

    let routingKey = this.channel.config.consumerConfig.subject;
    const h = headers();

    if (
      this.channel.config.consumerConfig.subject.includes('>') ||
      this.channel.config.consumerConfig.subject.includes('*')
    ) {
      routingKey = message.messageRoutingKey;
    }

    h.set('messaging-routing-key', message.messageRoutingKey);

    js.publish(routingKey, JSON.stringify(message.message), {
      headers: h,
    }).catch((err) => {});
  }
}
