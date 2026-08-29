import { Global, Module } from '@nestjs/common';
import { MqttChannelFactory } from './channel/mqtt.channel-factory.js';
import { MqttMessagingConsumer } from './consumer/mqtt-messaging.consumer.js';
import { MqttMessageBusFactory } from './message-bus/mqtt-message-bus-factory.js';
@Global()
@Module({
  providers: [MqttChannelFactory, MqttMessageBusFactory, MqttMessagingConsumer],
})
export class MessagingMqttExtensionModule {}
