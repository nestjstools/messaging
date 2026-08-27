import { PostgresChannelConfig } from '../../src/channel/postgres.channel-config';

describe('PostgresChannelConfig', () => {
  const input = {
    name: 'jobs',
    connectionString: 'postgres://postgres:postgres@localhost:5432/messaging',
    queue: 'application-jobs',
  };

  it('sets safe worker defaults', () => {
    const config = new PostgresChannelConfig(input);

    expect(config.workerConcurrency).toBe(1);
    expect(config.queuePolicy).toEqual({});
  });

  it('requires a connection string and queue name', () => {
    expect(
      () => new PostgresChannelConfig({ ...input, connectionString: '' }),
    ).toThrow('PostgreSQL connection string is required');
    expect(() => new PostgresChannelConfig({ ...input, queue: '' })).toThrow(
      'PostgreSQL queue name is required',
    );
  });

  it('requires a positive integer worker concurrency', () => {
    expect(
      () => new PostgresChannelConfig({ ...input, workerConcurrency: 0 }),
    ).toThrow('PostgreSQL worker concurrency must be a positive integer');
  });
});
