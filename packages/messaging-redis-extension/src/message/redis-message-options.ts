import type { JobsOptions } from 'bullmq';

export class RedisMessageOptions {
  constructor(public readonly jobOptions: JobsOptions = {}) {}
}
