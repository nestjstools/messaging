import { Injectable } from '@nestjs/common';
import { IChannelFactory } from '../i-channel-factory';
import { ChannelFactory } from '../../dependency-injection/decorator';
import { ChannelConfig, InMemoryChannelConfig } from '../../config';
import { Channel } from '../channel';
import { InMemoryChannel } from '../in-memory.channel';
import { InvalidChannelConfigException } from '../../exception/invalid-channel-config.exception';

@Injectable()
@ChannelFactory(InMemoryChannelConfig)
export class InMemoryChannelFactory implements IChannelFactory {
  create(channelConfig: ChannelConfig): Channel {
    if (!(channelConfig instanceof InMemoryChannelConfig)) {
      throw new InvalidChannelConfigException(InMemoryChannelConfig.name);
    }

    return new InMemoryChannel(channelConfig);
  }
}
