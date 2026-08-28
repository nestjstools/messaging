import { MqttMessagingConsumer } from '../../../src/consumer/mqtt-messaging.consumer';
import { MqttChannelConfig } from '../../../src/channel/mqtt.channel-config';

describe('MqttMessagingConsumer', () => {
  it('uses the fixed routing key for a matching wildcard subscription', async () => {
    let listener:
      | ((topic: string, payload: Buffer, packet: any) => void)
      | undefined;
    const client = {
      subscribe: jest.fn((_topics, callback) => callback()),
      on: jest.fn((_event, callback) => {
        listener = callback;
      }),
    };
    const channel = {
      config: new MqttChannelConfig({
        name: 'events',
        brokerUrl: 'mqtt://localhost',
        subscriptions: [
          { topicFilter: 'devices/+/status', routingKey: 'device.status' },
        ],
      }),
      start: jest.fn().mockResolvedValue(client),
    };
    const dispatcher = { dispatch: jest.fn().mockResolvedValue(undefined) };
    await new MqttMessagingConsumer().consume(
      dispatcher as any,
      channel as any,
    );
    listener!(
      'devices/a/status',
      Buffer.from(
        JSON.stringify({ payload: { online: true }, routingKey: 'other' }),
      ),
      { qos: 1, retain: false, dup: false },
    );
    await Promise.resolve();
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        message: { online: true },
        routingKey: 'device.status',
        metadata: expect.objectContaining({ qos: 1 }),
      }),
    );
  });

  it('decodes JSON published by a standard MQTT client as an object', async () => {
    let listener:
      | ((topic: string, payload: Buffer, packet: any) => void)
      | undefined;
    const client = {
      on: jest.fn((_event, callback) => {
        listener = callback;
      }),
      subscribe: jest.fn((_topics, callback) => callback()),
    };
    const channel = {
      config: new MqttChannelConfig({
        name: 'events',
        brokerUrl: 'mqtt://localhost',
        subscriptions: [{ topicFilter: 'orders/events' }],
      }),
      start: jest.fn().mockResolvedValue(client),
    };
    const dispatcher = { dispatch: jest.fn().mockResolvedValue(undefined) };

    await new MqttMessagingConsumer().consume(
      dispatcher as any,
      channel as any,
    );
    listener!(
      'orders/events',
      Buffer.from(JSON.stringify({ orderId: '123' })),
      { qos: 1, retain: false, dup: false },
    );

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        message: { orderId: '123' },
        routingKey: 'orders/events',
      }),
    );
  });

  it('lets ConsumerMessageBus finish its error logging and hooks', async () => {
    await expect(
      new MqttMessagingConsumer().onError({
        error: new Error('handler failed'),
      } as any),
    ).resolves.toBeUndefined();
  });
});
