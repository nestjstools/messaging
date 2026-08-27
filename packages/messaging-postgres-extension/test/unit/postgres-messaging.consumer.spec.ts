import { ConsumerMessageBus } from '@nestjstools/messaging';
import { PostgresMessagingConsumer } from '../../src/consumer/postgres-messaging.consumer';

describe('PostgresMessagingConsumer', () => {
  it('dispatches the stored payload with its original routing key', async () => {
    const consumer = new PostgresMessagingConsumer();
    const dispatch = jest.fn().mockResolvedValue(undefined);
    let worker: (jobs: any[]) => Promise<void>;
    const channel = {
      config: { queue: 'jobs', workerConcurrency: 2 },
      start: jest.fn(),
      boss: {
        work: jest
          .fn()
          .mockImplementation(
            async (_queue: string, handler: typeof worker) => {
              worker = handler;
            },
          ),
      },
    };

    await consumer.consume(
      { dispatch } as unknown as ConsumerMessageBus,
      channel as any,
    );
    await worker!([
      { data: { payload: { id: '123' }, routingKey: 'order.created' } },
    ]);

    expect(channel.start).toHaveBeenCalledTimes(1);
    expect(channel.boss.work).toHaveBeenCalledTimes(2);
    expect(channel.boss.work).toHaveBeenCalledWith(
      'jobs',
      expect.any(Function),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        message: { id: '123' },
        routingKey: 'order.created',
      }),
    );
  });

  it('rethrows a dispatch error so pg-boss applies its retry policy', async () => {
    const consumer = new PostgresMessagingConsumer();
    const error = new Error('handler failed');
    const dispatch = jest.fn().mockImplementation(async (message) => {
      message.metadata.POSTGRES_DISPATCH_ERROR = error;
    });
    let worker: (jobs: any[]) => Promise<void>;
    const channel = {
      config: { queue: 'jobs', workerConcurrency: 1 },
      start: jest.fn(),
      boss: {
        work: jest
          .fn()
          .mockImplementation(
            async (_queue: string, handler: typeof worker) => {
              worker = handler;
            },
          ),
      },
    };

    await consumer.consume(
      { dispatch } as unknown as ConsumerMessageBus,
      channel as any,
    );

    await expect(
      worker!([
        { data: { payload: { id: '123' }, routingKey: 'order.created' } },
      ]),
    ).rejects.toThrow(error);
  });
});
