import { Injectable } from '@nestjs/common';
import {
  IMessageBus,
  IMessageBusFactory,
  MessageBusFactory,
} from '@nestjstools/messaging';
import { MqttChannel } from '../channel/mqtt.channel.js';
import { MqttMessageBus } from './mqtt-message.bus.js';
@Injectable()
@MessageBusFactory(MqttChannel)
export class MqttMessageBusFactory implements IMessageBusFactory<MqttChannel> {
  create(channel: MqttChannel): IMessageBus {
    return new MqttMessageBus(channel);
  }
}
