import { MessageOptions } from './message-options';
import { Message } from './message';

export class RoutingMessage implements Message {
  constructor(
    public readonly message: object,
    public readonly messageRoutingKey: string,
    public readonly messageOptions: MessageOptions | undefined = undefined,
  ) {}

  createWithOptions(options: MessageOptions): RoutingMessage {
    return new RoutingMessage(this.message, this.messageRoutingKey, options);
  }
}
