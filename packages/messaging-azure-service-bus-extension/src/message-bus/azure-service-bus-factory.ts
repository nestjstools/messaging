import { Injectable } from '@nestjs/common';
import { AzureServiceBusMessageBus } from './azure-service-bus-message-bus';
import { IMessageBusFactory } from '@nestjstools/messaging';
import { MessageBusFactory } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { AzureServiceBusChannel } from '../channel/azure-service-bus.channel';

@Injectable()
@MessageBusFactory(AzureServiceBusChannel)
export class AzureServiceBusFactory
  implements IMessageBusFactory<AzureServiceBusChannel>
{
  create(channel: AzureServiceBusChannel): IMessageBus {
    return new AzureServiceBusMessageBus(channel);
  }
}
