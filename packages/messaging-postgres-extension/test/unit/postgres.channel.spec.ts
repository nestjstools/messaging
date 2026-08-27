import { PostgresChannel } from '../../src/channel/postgres.channel';
import { PostgresChannelConfig } from '../../src/channel/postgres.channel-config';

describe('PostgresChannel', () => {
  it('starts pg-boss once and initializes the queue and dead-letter queue', async () => {
    const channel = new PostgresChannel(
      new PostgresChannelConfig({
        name: 'jobs',
        connectionString:
          'postgres://postgres:postgres@localhost:5432/messaging',
        queue: 'application-jobs',
        queuePolicy: { deadLetter: 'application-jobs-dlq' },
      }),
    );
    const start = jest.spyOn(channel.boss, 'start');
    const createQueue = jest.spyOn(channel.boss, 'createQueue');

    await channel.start();
    await channel.start();

    expect(start).toHaveBeenCalledTimes(1);
    expect(createQueue).toHaveBeenCalledWith('application-jobs');
    expect(createQueue).toHaveBeenCalledWith('application-jobs-dlq');
  });
});
