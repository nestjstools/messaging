import { Global, Module } from '@nestjs/common';
import { AzureServiceBusMessagingConsumer } from './consumer/azure-service-bus-messaging-consumer.js';
import { AzureServiceBusChannelFactory } from './channel/azure-service-bus-channel-factory.js';
import { AzureServiceBusFactory } from './message-bus/azure-service-bus-factory.js';

@Global()
@Module({
  providers: [
    AzureServiceBusFactory,
    AzureServiceBusChannelFactory,
    AzureServiceBusMessagingConsumer,
  ],
})
export class MessagingAzureServiceBusExtensionModule {}
