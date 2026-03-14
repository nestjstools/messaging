import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { NatsJetStreamChannelConfig } from './nats-jet-stream-channel.config';
import { NatsJetStreamChannel } from './nats-jet-stream.channel';

@Injectable()
@ChannelFactory(NatsJetStreamChannelConfig)
export class NatsJetStreamChannelFactory
  implements IChannelFactory<NatsJetStreamChannelConfig>
{
  create(channelConfig: NatsJetStreamChannelConfig): NatsJetStreamChannel {
    return new NatsJetStreamChannel(channelConfig);
  }
}
