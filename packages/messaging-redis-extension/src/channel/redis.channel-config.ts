import { ChannelConfig } from '@nestjstools/messaging';
import { KeepJobs } from 'bullmq';

export class RedisChannelConfig extends ChannelConfig {
  public readonly connection: Connection;
  public readonly queue: string;
  /**
   * @description
   * This prefix is not used as RedisOptions keyPrefix, it is used as prefix for BullMQ
   * Read more: https://github.com/taskforcesh/bullmq/issues/1219#issuecomment-1113903785
   */
  public readonly keyPrefix?: string;
  public readonly bullJobOptions?: BullJobOptions;

  constructor({
    name,
    connection,
    queue,
    enableConsumer,
    avoidErrorsForNotExistedHandlers,
    middlewares,
    normalizer,
    keyPrefix,
    bullJobOptions,
  }: RedisChannelConfig) {
    super(
      name,
      avoidErrorsForNotExistedHandlers,
      middlewares,
      enableConsumer,
      normalizer,
    );
    this.connection = connection;
    this.queue = queue;
    this.keyPrefix = keyPrefix;
    this.bullJobOptions = bullJobOptions;
  }
}

interface Connection {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

interface BullJobOptions {
  /**
   * If true, removes the job when it successfully completes
   * When given a number, it specifies the maximum amount of
   * jobs to keep, or you can provide an object specifying max
   * age and/or count to keep. It overrides whatever setting is used in the worker.
   * Default behavior is to keep the job in the completed set.
   */
  removeOnComplete?: number | boolean | KeepJobs;
  /**
   * If true, removes the job when it fails after all attempts.
   * When given a number, it specifies the maximum amount of
   * jobs to keep, or you can provide an object specifying max
   * age and/or count to keep. It overrides whatever setting is used in the worker.
   * Default behavior is to keep the job in the failed set.
   */
  removeOnFail?: number | boolean | KeepJobs;
}
