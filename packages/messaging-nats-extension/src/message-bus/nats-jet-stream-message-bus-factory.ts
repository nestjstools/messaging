import { Injectable } from '@nestjs/common';
import { IMessageBusFactory } from '@nestjstools/messaging';
import { MessageBusFactory } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { NatsJetStreamChannel } from '../channel/nats-jet-stream.channel.js';
import { NatsJetStreamMessageBus } from './nats-jet-stream-message-bus.js';

@Injectable()
@MessageBusFactory(NatsJetStreamChannel)
export class NatsJetStreamMessageBusFactory implements IMessageBusFactory<NatsJetStreamChannel> {
  create(channel: NatsJetStreamChannel): IMessageBus {
    return new NatsJetStreamMessageBus(channel);
  }
}
