import { Global, Module } from '@nestjs/common';
import { MqttChannelFactory } from './channel/mqtt.channel-factory';
import { MqttMessagingConsumer } from './consumer/mqtt-messaging.consumer';
import { MqttMessageBusFactory } from './message-bus/mqtt-message-bus-factory';
@Global()
@Module({
  providers: [MqttChannelFactory, MqttMessageBusFactory, MqttMessagingConsumer],
})
export class MessagingMqttExtensionModule {}
