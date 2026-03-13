import { AmqpChannel } from './amqp.channel';
import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { RmqChannelConfig } from './rmq-channel.config';

@Injectable()
@ChannelFactory(RmqChannelConfig)
export class RmqChannelFactory implements IChannelFactory<RmqChannelConfig> {
  create(channelConfig: RmqChannelConfig): AmqpChannel {
    return new AmqpChannel(channelConfig);
  }
}
