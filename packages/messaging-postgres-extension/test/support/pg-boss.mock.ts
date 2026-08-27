class PgBoss {
  constructor(..._args: unknown[]) {}

  async start(): Promise<this> {
    return this;
  }

  async stop(): Promise<void> {}

  async createQueue(_name: string): Promise<void> {}
}

export = PgBoss;
