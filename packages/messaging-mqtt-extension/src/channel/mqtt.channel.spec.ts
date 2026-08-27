import { MqttChannel } from './mqtt.channel';
import { MqttChannelConfig } from './mqtt.channel-config';

describe('MqttChannel', () => {
  it('closes its owned client on channel destruction', async () => {
    const end = jest.fn((_force, _options, callback) => callback());
    const channel = new MqttChannel(
      new MqttChannelConfig({ name: 'events', brokerUrl: 'mqtt://localhost' }),
    );
    (channel as any).client = { end };
    await channel.onChannelDestroy();
    expect(end).toHaveBeenCalledWith(false, {}, expect.any(Function));
  });
});
