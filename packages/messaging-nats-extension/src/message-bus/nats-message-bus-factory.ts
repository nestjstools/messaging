import { Injectable } from '@nestjs/common';
import { NatsMessageBus } from './nats-message-bus.js';
import { IMessageBusFactory } from '@nestjstools/messaging';
import { MessageBusFactory } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { NatsChannel } from '../channel/nats.channel.js';

@Injectable()
@MessageBusFactory(NatsChannel)
export class NatsMessageBusFactory implements IMessageBusFactory<NatsChannel> {
  create(channel: NatsChannel): IMessageBus {
    return new NatsMessageBus(channel);
  }
}
