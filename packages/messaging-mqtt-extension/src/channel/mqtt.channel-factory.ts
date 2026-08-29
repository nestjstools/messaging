import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { MqttChannel } from './mqtt.channel.js';
import { MqttChannelConfig } from './mqtt.channel-config.js';
@Injectable()
@ChannelFactory(MqttChannelConfig)
export class MqttChannelFactory implements IChannelFactory<MqttChannelConfig> {
  create(config: MqttChannelConfig): MqttChannel {
    return new MqttChannel(config);
  }
}
