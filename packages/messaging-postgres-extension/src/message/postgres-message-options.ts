import PgBoss = require('pg-boss');

export class PostgresMessageOptions {
  constructor(
    public readonly queue?: string,
    public readonly sendOptions: PgBoss.SendOptions = {},
  ) {}
}
