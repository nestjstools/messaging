export class ConsumerMessage {
  constructor(
    public readonly message: object | string,
    public readonly routingKey: string,
    public readonly metadata: {} = {},
  ) {
    this.message = message;
    this.routingKey = routingKey;
  }
}
