import { describe, expect, it, vi } from 'vitest';
import { ConsumerMessageBus } from '@nestjstools/messaging';
import { Worker } from 'bullmq';
import { RedisChannelConfig } from '../../../src/channel/redis.channel-config.js';
import { RedisChannel } from '../../../src/channel/redis.channel.js';
import { RedisMessagingConsumer } from '../../../src/consumer/redis-messaging.consumer.js';

vi.mock('bullmq', () => ({
  Worker: vi.fn(function () {
    return { close: vi.fn().mockResolvedValue(undefined) };
  }),
}));

describe('RedisMessagingConsumer concurrency', () => {
  it.each([undefined, 5])(
    'passes concurrency %s from channel config to the worker',
    async (concurrency) => {
      const config = new RedisChannelConfig({
        name: 'commands',
        queue: 'commands',
        connection: { host: 'localhost', port: 6379 },
        concurrency,
      });
      const channel = {
        config,
        queue: { close: vi.fn().mockResolvedValue(undefined) },
      } as unknown as RedisChannel;
      const dispatcher = {
        dispatch: vi.fn().mockResolvedValue(undefined),
      } as unknown as ConsumerMessageBus;
      const consumer = new RedisMessagingConsumer();

      await consumer.consume(dispatcher, channel);

      expect(Worker).toHaveBeenLastCalledWith(
        'commands',
        expect.any(Function),
        expect.objectContaining({ concurrency: concurrency ?? 1 }),
      );

      await consumer.onModuleDestroy();
    },
  );
});
