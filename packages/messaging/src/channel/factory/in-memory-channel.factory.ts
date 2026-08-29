import { Injectable } from '@nestjs/common';
import { IChannelFactory } from '../i-channel-factory.js';
import { ChannelFactory } from '../../dependency-injection/decorator.js';
import { ChannelConfig, InMemoryChannelConfig } from '../../config.js';
import { Channel } from '../channel.js';
import { InMemoryChannel } from '../in-memory.channel.js';
import { InvalidChannelConfigException } from '../../exception/invalid-channel-config.exception.js';

@Injectable()
@ChannelFactory(InMemoryChannelConfig)
export class InMemoryChannelFactory implements IChannelFactory<InMemoryChannelConfig> {
  create(channelConfig: ChannelConfig): Channel<InMemoryChannelConfig> {
    if (!(channelConfig instanceof InMemoryChannelConfig)) {
      throw new InvalidChannelConfigException(InMemoryChannelConfig.name);
    }

    return new InMemoryChannel(channelConfig);
  }
}
