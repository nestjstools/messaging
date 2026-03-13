import { Global, Module } from '@nestjs/common';
import { GooglePubSubMessagingConsumer } from './consumer/google-pub-sub-messaging.consumer';
import { GooglePubSubChannelFactory } from './channel/google-pub-sub.channel-factory';
import { GooglePubSubMessageBusFactory } from './message-bus/google-pub-sub-message-bus-factory';

@Global()
@Module({
  providers: [
    GooglePubSubMessageBusFactory,
    GooglePubSubChannelFactory,
    GooglePubSubMessagingConsumer,
  ],
})
export class MessagingGooglePubSubExtensionModule {}
