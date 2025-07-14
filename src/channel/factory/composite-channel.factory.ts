import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Channel } from '../channel';
import { ChannelConfig } from '../../config';
import { CHANNEL_FACTORY_METADATA } from '../../dependency-injection/decorator';
import { UnsupportedChannelFactoryException } from '../../exception/unsupported-channel-factory.exception';

@Injectable()
export class CompositeChannelFactory {
  constructor(private readonly discoveryService: DiscoveryService) {}

  create(channelConfig: ChannelConfig): Channel<any> {
    const factory = this.discoveryService
      .getProviders()
      .filter((provider) => {
        if (!provider.metatype) {
          return false;
        }

        return Reflect.hasMetadata(CHANNEL_FACTORY_METADATA, provider.metatype);
      })
      .filter(
        (factory) =>
          Reflect.getMetadata(CHANNEL_FACTORY_METADATA, factory.metatype)
            .name === channelConfig.constructor.name,
      );

    if (factory.length !== 1) {
      throw new UnsupportedChannelFactoryException(
        channelConfig.constructor.name,
      );
    }

    return factory[0].instance.create(channelConfig);
  }
}
