import { Injectable } from '@nestjs/common';
import { IMessageBus, RoutingMessage } from '@nestjstools/messaging';
import type { IClientPublishOptions } from 'mqtt';
import { MqttChannel } from '../channel/mqtt.channel';
import { MqttMessageEnvelope } from '../message/mqtt-message-envelope';
import { MqttMessageOptions } from '../message/mqtt-message-options';

@Injectable()
export class MqttMessageBus implements IMessageBus {
  constructor(private readonly channel: MqttChannel) {}
  async dispatch(message: RoutingMessage): Promise<void> {
    if (
      message.messageOptions !== undefined &&
      !(message.messageOptions instanceof MqttMessageOptions)
    )
      throw new Error(
        `Message options must be a ${MqttMessageOptions.name} object`,
      );
    const messageOptions = message.messageOptions as
      | MqttMessageOptions
      | undefined;
    const topic = messageOptions?.options.topic ?? message.messageRoutingKey;
    if (!topic.trim()) throw new Error('MQTT publish topic is required');
    const envelope: MqttMessageEnvelope = {
      payload: message.message,
      routingKey: message.messageRoutingKey,
      headers: {},
      timestamp: new Date().toISOString(),
      messageId:
        globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    };
    const options: IClientPublishOptions = {
      qos: messageOptions?.options.qos ?? this.channel.config.defaultQos,
      retain: messageOptions?.options.retain,
      dup: messageOptions?.options.dup,
      properties: messageOptions?.options.properties,
    };
    const client = await this.channel.start();
    await new Promise<void>((resolve, reject) =>
      client.publish(topic, JSON.stringify(envelope), options, (error) =>
        error ? reject(error) : resolve(),
      ),
    );
  }
}
