import { RoutingMessage } from '@nestjstools/messaging';
import { PostgresMessageBus } from '../../src/message-bus/postgres-message.bus';
import { PostgresMessageOptions } from '../../src/message/postgres-message-options';

describe('PostgresMessageBus', () => {
  it('sends the message envelope to the configured queue', async () => {
    const start = jest.fn();
    const send = jest.fn().mockResolvedValue('job-id');
    const channel = {
      config: { queue: 'jobs', queuePolicy: { retryLimit: 2 } },
      start,
      ensureQueue: jest.fn(),
      boss: { send },
    };
    const bus = new PostgresMessageBus(channel as any);

    await bus.dispatch(new RoutingMessage({ id: '123' }, 'order.created'));

    expect(start).toHaveBeenCalledTimes(1);
    expect(channel.ensureQueue).toHaveBeenCalledWith('jobs');
    expect(send).toHaveBeenCalledWith(
      'jobs',
      { payload: { id: '123' }, routingKey: 'order.created' },
      { retryLimit: 2 },
    );
  });

  it('uses supported message options to override queue policy', async () => {
    const send = jest.fn().mockResolvedValue('job-id');
    const channel = {
      config: { queue: 'jobs', queuePolicy: { retryLimit: 2 } },
      start: jest.fn(),
      ensureQueue: jest.fn(),
      boss: { send },
    };
    const bus = new PostgresMessageBus(channel as any);
    const message = new RoutingMessage(
      { id: '123' },
      'order.created',
      new PostgresMessageOptions('priority-jobs', {
        priority: 10,
        deadLetter: 'priority-jobs-dlq',
      }),
    );

    await bus.dispatch(message);

    expect(send).toHaveBeenCalledWith(
      'priority-jobs',
      { payload: { id: '123' }, routingKey: 'order.created' },
      { retryLimit: 2, priority: 10, deadLetter: 'priority-jobs-dlq' },
    );
    expect(channel.ensureQueue).toHaveBeenNthCalledWith(1, 'priority-jobs');
    expect(channel.ensureQueue).toHaveBeenNthCalledWith(2, 'priority-jobs-dlq');
  });

  it('rejects options for another transport', async () => {
    const bus = new PostgresMessageBus({
      config: { queue: 'jobs', queuePolicy: {} },
      start: jest.fn(),
      ensureQueue: jest.fn(),
      boss: { send: jest.fn() },
    } as any);
    const message = new RoutingMessage({ id: '123' }, 'order.created', {});

    await expect(bus.dispatch(message)).rejects.toThrow(
      'Message options must be a PostgresMessageOptions object',
    );
  });
});
