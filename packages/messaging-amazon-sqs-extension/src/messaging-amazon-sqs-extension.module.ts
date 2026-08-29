import { Global, Module } from '@nestjs/common';
import { AmazonSqsMessagingConsumer } from './consumer/amazon-sqs-messaging.consumer.js';
import { AmazonSqsChannelFactory } from './channel/amazon-sqs.channel-factory.js';
import { AmazonSqsMessageBusFactory } from './message-bus/amazon-sqs-message-bus-factory.js';

@Global()
@Module({
  providers: [
    AmazonSqsMessageBusFactory,
    AmazonSqsChannelFactory,
    AmazonSqsMessagingConsumer,
  ],
})
export class MessagingAmazonSqsExtensionModule {}
