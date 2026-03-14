import { Global, Module } from '@nestjs/common';
import { AmazonSqsMessagingConsumer } from './consumer/amazon-sqs-messaging.consumer';
import { AmazonSqsChannelFactory } from './channel/amazon-sqs.channel-factory';
import { AmazonSqsMessageBusFactory } from './message-bus/amazon-sqs-message-bus-factory';

@Global()
@Module({
  providers: [
    AmazonSqsMessageBusFactory,
    AmazonSqsChannelFactory,
    AmazonSqsMessagingConsumer,
  ],
})
export class MessagingAmazonSqsExtensionModule {}
