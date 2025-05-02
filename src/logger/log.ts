export class Log {
  private constructor(
    public readonly content: string,
    private readonly metadata?: Metadata
  ) {}

  static create(content: string, metadata?: Metadata): Log {
    return new Log(content, metadata ?? {});
  }

  toObject(): object {
    return {
      logMessage: this.content,
      metadata: this.metadata ?? [],
    }
  }
}

type Metadata = { [key: string]: any };
