import { Injectable } from '@nestjs/common';
import { IMessageBusFactory } from '@nestjstools/messaging';
import { MessageBusFactory } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { NatsJetStreamChannel } from '../channel/nats-jet-stream.channel';
import { NatsJetStreamMessageBus } from './nats-jet-stream-message-bus';

@Injectable()
@MessageBusFactory(NatsJetStreamChannel)
export class NatsJetStreamMessageBusFactory
  implements IMessageBusFactory<NatsJetStreamChannel>
{
  create(channel: NatsJetStreamChannel): IMessageBus {
    return new NatsJetStreamMessageBus(channel);
  }
}
