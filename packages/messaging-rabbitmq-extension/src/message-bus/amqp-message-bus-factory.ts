import { Injectable } from '@nestjs/common';
import { AmqpMessageBus } from './amqp-message.bus';
import { AmqpChannel } from '../channel/amqp.channel';
import { IMessageBusFactory } from '@nestjstools/messaging';
import { MessageBusFactory } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';

@Injectable()
@MessageBusFactory(AmqpChannel)
export class AmqpMessageBusFactory implements IMessageBusFactory<AmqpChannel> {
  create(channel: AmqpChannel): IMessageBus {
    return new AmqpMessageBus(channel);
  }
}
