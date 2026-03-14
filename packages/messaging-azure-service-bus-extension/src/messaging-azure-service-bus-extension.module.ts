import { Global, Module } from '@nestjs/common';
import { AzureServiceBusMessagingConsumer } from './consumer/azure-service-bus-messaging-consumer';
import { AzureServiceBusChannelFactory } from './channel/azure-service-bus-channel-factory';
import { AzureServiceBusFactory } from './message-bus/azure-service-bus-factory';

@Global()
@Module({
  providers: [
    AzureServiceBusFactory,
    AzureServiceBusChannelFactory,
    AzureServiceBusMessagingConsumer,
  ],
})
export class MessagingAzureServiceBusExtensionModule {}
