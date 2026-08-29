import { vi } from 'vitest';
import { MqttChannel } from '../../../src/channel/mqtt.channel.js';
import { MqttChannelConfig } from '../../../src/channel/mqtt.channel-config.js';

describe('MqttChannel', () => {
  it('closes its owned client on channel destruction', async () => {
    const end = vi.fn((_force, _options, callback) => callback());
    const channel = new MqttChannel(
      new MqttChannelConfig({ name: 'events', brokerUrl: 'mqtt://localhost' }),
    );
    (channel as any).client = { end };
    await channel.onChannelDestroy();
    expect(end).toHaveBeenCalledWith(false, {}, expect.any(Function));
  });
});
