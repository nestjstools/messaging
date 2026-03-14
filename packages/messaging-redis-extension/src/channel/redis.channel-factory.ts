import { RedisChannel } from './redis.channel';
import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { RedisChannelConfig } from './redis.channel-config';

@Injectable()
@ChannelFactory(RedisChannelConfig)
export class RedisChannelFactory implements IChannelFactory<RedisChannelConfig> {
  create(channelConfig: RedisChannelConfig): RedisChannel {
    return new RedisChannel(channelConfig);
  }
}
