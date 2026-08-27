import { MqttMessagingConsumer } from './mqtt-messaging.consumer';
import { MqttChannelConfig } from '../channel/mqtt.channel-config';

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

  it('rejects consumer failures so core can report the failure', async () => {
    await expect(
      new MqttMessagingConsumer().onError({
        error: new Error('handler failed'),
      } as any),
    ).rejects.toThrow('handler failed');
  });
});
