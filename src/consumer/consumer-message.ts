export class ConsumerMessage {
  constructor(
    public readonly message: object|string,
    public readonly routingKey: string,
    public readonly metadata: any[] = [],
  ) {
    this.message = message;
    this.routingKey = routingKey;
    this.metadata = metadata ?? [];
  }
}
