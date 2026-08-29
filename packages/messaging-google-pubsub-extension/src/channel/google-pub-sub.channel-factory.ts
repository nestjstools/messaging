import { GooglePubSubChannel } from './google-pub-sub.channel.js';
import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { GooglePubSubChannelConfig } from './google-pub-sub.channel-config.js';

@Injectable()
@ChannelFactory(GooglePubSubChannelConfig)
export class GooglePubSubChannelFactory implements IChannelFactory<GooglePubSubChannelConfig> {
  create(channelConfig: GooglePubSubChannelConfig): GooglePubSubChannel {
    return new GooglePubSubChannel(channelConfig);
  }
}
