import { MqttChannelConfig } from '../../../src/channel/mqtt.channel-config.js';

describe('MqttChannelConfig', () => {
  it('applies MQTT defaults', () => {
    const config = new MqttChannelConfig({
      name: 'events',
      brokerUrl: 'mqtt://localhost:1883',
    });
    expect(config).toMatchObject({
      protocolVersion: 4,
      clean: true,
      keepalive: 60,
      reconnectPeriod: 1000,
      defaultQos: 0,
      subscriptions: [],
    });
  });

  it.each([
    [{ name: '', brokerUrl: 'mqtt://localhost' }, 'name'],
    [{ name: 'events', brokerUrl: 'http://localhost' }, 'brokerUrl'],
    [
      { name: 'events', brokerUrl: 'mqtt://localhost', defaultQos: 3 as 0 },
      'defaultQos',
    ],
    [
      {
        name: 'events',
        brokerUrl: 'mqtt://localhost',
        subscriptions: [{ topicFilter: '', qos: 0 }],
      },
      'topicFilter',
    ],
  ])('rejects invalid configuration %#', (options, expected) => {
    expect(() => new MqttChannelConfig(options as any)).toThrow(expected);
  });
});
