import { Injectable } from '@nestjs/common';
import { GooglePubSubMessageBus } from './google-pub-sub-message.bus';
import { IMessageBusFactory } from '@nestjstools/messaging';
import { MessageBusFactory } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { GooglePubSubChannel } from '../channel/google-pub-sub.channel';

@Injectable()
@MessageBusFactory(GooglePubSubChannel)
export class GooglePubSubMessageBusFactory
  implements IMessageBusFactory<GooglePubSubChannel>
{
  create(channel: GooglePubSubChannel): IMessageBus {
    return new GooglePubSubMessageBus(channel);
  }
}
