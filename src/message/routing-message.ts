import { MessageOptions } from './message-options';

export class RoutingMessage {
  constructor(
    public readonly message: object,
    public readonly messageRoutingKey: string,
    public readonly messageOptions: MessageOptions | undefined = undefined,
  ) {}

  createWithOptions(options: MessageOptions): RoutingMessage {
    return new RoutingMessage(this.message, this.messageRoutingKey, options);
  }
}
