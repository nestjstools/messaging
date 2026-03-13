import { AzureServiceBusChannel } from './azure-service-bus.channel';
import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { AzureServiceBusChannelConfig } from './azure-service-bus-channel.config';

@Injectable()
@ChannelFactory(AzureServiceBusChannelConfig)
export class AzureServiceBusChannelFactory
  implements IChannelFactory<AzureServiceBusChannelConfig>
{
  create(channelConfig: AzureServiceBusChannelConfig): AzureServiceBusChannel {
    return new AzureServiceBusChannel(channelConfig);
  }
}
