import { Injectable } from '@nestjs/common';
import { AmazonSqsMessageBus } from './amazon-sqs-message.bus.js';
import { IMessageBusFactory } from '@nestjstools/messaging';
import { MessageBusFactory } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { AmazonSqsChannel } from '../channel/amazon-sqs.channel.js';

@Injectable()
@MessageBusFactory(AmazonSqsChannel)
export class AmazonSqsMessageBusFactory implements IMessageBusFactory<AmazonSqsChannel> {
  create(channel: AmazonSqsChannel): IMessageBus {
    return new AmazonSqsMessageBus(channel);
  }
}
