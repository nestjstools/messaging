import { Injectable } from '@nestjs/common';
import {
  IMessageBus,
  IMessageBusFactory,
  MessageBusFactory,
} from '@nestjstools/messaging';
import { MqttChannel } from '../channel/mqtt.channel';
import { MqttMessageBus } from './mqtt-message.bus';
@Injectable()
@MessageBusFactory(MqttChannel)
export class MqttMessageBusFactory implements IMessageBusFactory<MqttChannel> {
  create(channel: MqttChannel): IMessageBus {
    return new MqttMessageBus(channel);
  }
}
