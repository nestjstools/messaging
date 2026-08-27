import { ChannelConfig } from '@nestjstools/messaging';
import PgBoss = require('pg-boss');

export type PostgresQueuePolicy = Pick<
  PgBoss.SendOptions,
  | 'retryLimit'
  | 'retryDelay'
  | 'retryBackoff'
  | 'expireInSeconds'
  | 'retentionSeconds'
  | 'deadLetter'
>;

export interface PostgresChannelConfigOptions {
  name: string;
  connectionString: string;
  queue: string;
  schema?: string;
  workerConcurrency?: number;
  autoCreate?: boolean;
  queuePolicy?: PostgresQueuePolicy;
  enableConsumer?: boolean;
  avoidErrorsForNotExistedHandlers?: boolean;
  middlewares?: object[];
  normalizer?: object;
}

export class PostgresChannelConfig extends ChannelConfig {
  public readonly connectionString: string;
  public readonly queue: string;
  public readonly schema?: string;
  public readonly workerConcurrency: number;
  public readonly autoCreate: boolean;
  public readonly queuePolicy: PostgresQueuePolicy;

  constructor({
    name,
    connectionString,
    queue,
    schema,
    workerConcurrency,
    autoCreate,
    queuePolicy,
    enableConsumer,
    avoidErrorsForNotExistedHandlers,
    middlewares,
    normalizer,
  }: PostgresChannelConfigOptions) {
    super(
      name,
      avoidErrorsForNotExistedHandlers,
      middlewares,
      enableConsumer,
      normalizer,
    );

    if (!connectionString) {
      throw new Error('PostgreSQL connection string is required');
    }
    if (!queue) {
      throw new Error('PostgreSQL queue name is required');
    }
    if (
      !Number.isInteger(workerConcurrency ?? 1) ||
      (workerConcurrency ?? 1) < 1
    ) {
      throw new Error(
        'PostgreSQL worker concurrency must be a positive integer',
      );
    }

    this.connectionString = connectionString;
    this.queue = queue;
    this.schema = schema;
    this.workerConcurrency = workerConcurrency ?? 1;
    this.autoCreate = autoCreate ?? true;
    this.queuePolicy = queuePolicy ?? {};
  }
}
