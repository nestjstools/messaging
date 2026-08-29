import { AmazonSqsChannel } from './amazon-sqs.channel.js';
import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { AmazonSqsChannelConfig } from './amazon-sqs.channel-config.js';

@Injectable()
@ChannelFactory(AmazonSqsChannelConfig)
export class AmazonSqsChannelFactory implements IChannelFactory<AmazonSqsChannelConfig> {
  create(channelConfig: AmazonSqsChannelConfig): AmazonSqsChannel {
    return new AmazonSqsChannel(channelConfig);
  }
}
