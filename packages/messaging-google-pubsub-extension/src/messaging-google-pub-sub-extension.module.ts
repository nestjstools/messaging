import { Global, Module } from '@nestjs/common';
import { GooglePubSubMessagingConsumer } from './consumer/google-pub-sub-messaging.consumer.js';
import { GooglePubSubChannelFactory } from './channel/google-pub-sub.channel-factory.js';
import { GooglePubSubMessageBusFactory } from './message-bus/google-pub-sub-message-bus-factory.js';

@Global()
@Module({
  providers: [
    GooglePubSubMessageBusFactory,
    GooglePubSubChannelFactory,
    GooglePubSubMessagingConsumer,
  ],
})
export class MessagingGooglePubSubExtensionModule {}
