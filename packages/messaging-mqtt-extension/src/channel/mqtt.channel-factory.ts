import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { MqttChannel } from './mqtt.channel';
import { MqttChannelConfig } from './mqtt.channel-config';
@Injectable()
@ChannelFactory(MqttChannelConfig)
export class MqttChannelFactory implements IChannelFactory<MqttChannelConfig> {
  create(config: MqttChannelConfig): MqttChannel {
    return new MqttChannel(config);
  }
}
