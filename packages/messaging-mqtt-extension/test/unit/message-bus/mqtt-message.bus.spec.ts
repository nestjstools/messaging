import { vi } from 'vitest';
import { MqttMessageBus } from '../../../src/message-bus/mqtt-message.bus.js';
import { MqttMessageOptions } from '../../../src/message/mqtt-message-options.js';

describe('MqttMessageBus', () => {
  it('publishes an envelope, retaining the original routing key when topic is overridden', async () => {
    const publish = vi.fn((_topic, _payload, _options, callback) =>
      callback(),
    );
    const channel = {
      config: { defaultQos: 1 },
      start: vi.fn().mockResolvedValue({ publish }),
    };
    const bus = new MqttMessageBus(channel as any);
    await bus.dispatch({
      message: { id: 1 },
      messageRoutingKey: 'orders.created',
      messageOptions: new MqttMessageOptions({
        topic: 'orders/v1',
        qos: 2,
        retain: true,
      }),
    } as any);
    expect(publish).toHaveBeenCalledWith(
      'orders/v1',
      expect.stringContaining('"routingKey":"orders.created"'),
      expect.objectContaining({ qos: 2, retain: true }),
      expect.any(Function),
    );
  });

  it('rejects foreign message options', async () => {
    const bus = new MqttMessageBus({} as any);
    await expect(bus.dispatch({ messageOptions: {} } as any)).rejects.toThrow(
      MqttMessageOptions.name,
    );
  });
});
