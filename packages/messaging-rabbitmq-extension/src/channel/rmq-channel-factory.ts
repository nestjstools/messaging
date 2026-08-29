import { AmqpChannel } from './amqp.channel.js';
import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { RmqChannelConfig } from './rmq-channel.config.js';

@Injectable()
@ChannelFactory(RmqChannelConfig)
export class RmqChannelFactory implements IChannelFactory<RmqChannelConfig> {
  create(channelConfig: RmqChannelConfig): AmqpChannel {
    return new AmqpChannel(channelConfig);
  }
}
