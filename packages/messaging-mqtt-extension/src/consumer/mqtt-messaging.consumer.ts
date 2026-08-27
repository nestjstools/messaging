import { Injectable } from '@nestjs/common';
import {
  ConsumerDispatchedMessageError,
  ConsumerMessage,
  ConsumerMessageBus,
  IMessagingConsumer,
  MessageConsumer,
} from '@nestjstools/messaging';
import type { IPublishPacket } from 'mqtt';
import { MqttChannel } from '../channel/mqtt.channel';
import type { MqttMessageEnvelope } from '../message/mqtt-message-envelope';

@Injectable()
@MessageConsumer(MqttChannel)
export class MqttMessagingConsumer implements IMessagingConsumer<MqttChannel> {
  async consume(
    dispatcher: ConsumerMessageBus,
    channel: MqttChannel,
  ): Promise<void> {
    const client = await channel.start();
    if (channel.config.subscriptions.length === 0) return;
    const subscriptions = Object.fromEntries(
      channel.config.subscriptions.map(({ topicFilter, qos }) => [
        topicFilter,
        { qos: qos ?? channel.config.defaultQos },
      ]),
    );
    await new Promise<void>((resolve, reject) =>
      client.subscribe(subscriptions, (error) =>
        error ? reject(error) : resolve(),
      ),
    );
    client.on('message', (topic, payload, packet) => {
      const subscription = channel.config.subscriptions.find(
        ({ topicFilter }) => topicMatches(topicFilter, topic),
      );
      const decoded = decode(payload.toString(), topic);
      const routingKey = subscription?.routingKey ?? decoded.routingKey;
      void dispatcher
        .dispatch(
          new ConsumerMessage(decoded.payload, routingKey, metadata(packet)),
        )
        .catch(() => undefined);
    });
  }
  async onError(errored: ConsumerDispatchedMessageError): Promise<void> {
    return Promise.reject(errored.error);
  }
}

function decode(raw: string, topic: string): MqttMessageEnvelope {
  try {
    const value = JSON.parse(raw) as Partial<MqttMessageEnvelope>;
    if ('payload' in value && typeof value.routingKey === 'string')
      return {
        payload: value.payload as object | string,
        routingKey: value.routingKey,
        headers: value.headers ?? {},
        timestamp: value.timestamp ?? '',
        messageId: value.messageId ?? '',
      };
  } catch {}
  return {
    payload: raw,
    routingKey: topic,
    headers: {},
    timestamp: '',
    messageId: '',
  };
}
function metadata(packet: IPublishPacket): Record<string, unknown> {
  return {
    qos: packet.qos,
    retain: packet.retain,
    dup: packet.dup,
    properties: packet.properties ?? {},
  };
}
function topicMatches(filter: string, topic: string): boolean {
  const f = filter.split('/');
  const t = topic.split('/');
  return (
    f.every((part, index) =>
      part === '#' ? index === f.length - 1 : part === '+' || part === t[index],
    ) &&
    (f.at(-1) === '#' || f.length === t.length)
  );
}
