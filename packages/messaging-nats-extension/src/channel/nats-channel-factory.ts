import { NatsChannel } from './nats.channel';
import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { NatsChannelConfig } from './nats-channel.config';

@Injectable()
@ChannelFactory(NatsChannelConfig)
export class NatsChannelFactory implements IChannelFactory<NatsChannelConfig> {
  create(channelConfig: NatsChannelConfig): NatsChannel {
    return new NatsChannel(channelConfig);
  }
}
