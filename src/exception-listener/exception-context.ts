export class ExceptionContext {
  constructor(
    public readonly exception: Error,
    public readonly channelName: string,
    public readonly rawMessage: object|string,
    public readonly routingKey: string,
  ) {
  }
}
