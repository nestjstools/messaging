import { GooglePubSubChannel } from './google-pub-sub.channel';
import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { GooglePubSubChannelConfig } from './google-pub-sub.channel-config';

@Injectable()
@ChannelFactory(GooglePubSubChannelConfig)
export class GooglePubSubChannelFactory
  implements IChannelFactory<GooglePubSubChannelConfig>
{
  create(channelConfig: GooglePubSubChannelConfig): GooglePubSubChannel {
    return new GooglePubSubChannel(channelConfig);
  }
}
