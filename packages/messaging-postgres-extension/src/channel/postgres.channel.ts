import { Channel } from '@nestjstools/messaging';
import PgBoss = require('pg-boss');
import { PostgresChannelConfig } from './postgres.channel-config';

export class PostgresChannel extends Channel<PostgresChannelConfig> {
  public readonly boss: PgBoss;
  private started = false;
  private readonly initializedQueues = new Set<string>();

  constructor(config: PostgresChannelConfig) {
    super(config);
    this.boss = new PgBoss({
      connectionString: config.connectionString,
      schema: config.schema,
    });
  }

  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    await this.boss.start();
    this.started = true;
    await this.ensureQueue(this.config.queue);

    if (this.config.queuePolicy.deadLetter) {
      await this.ensureQueue(this.config.queuePolicy.deadLetter);
    }
  }

  async ensureQueue(queue: string): Promise<void> {
    if (!this.config.autoCreate || this.initializedQueues.has(queue)) {
      return;
    }

    await this.boss.createQueue(queue);
    this.initializedQueues.add(queue);
  }

  async onChannelDestroy(): Promise<void> {
    if (!this.started) {
      return;
    }

    await this.boss.stop();
    this.started = false;
    this.initializedQueues.clear();
  }
}
