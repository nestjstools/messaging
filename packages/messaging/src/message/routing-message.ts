import { DefaultMessageOptions } from './default-message-options';
import { Message } from './message';

export class RoutingMessage implements Message {
  constructor(
    public readonly message: object,
    public readonly messageRoutingKey: string,
    public readonly messageOptions?: unknown,
  ) {}

  createWithOptions(options: DefaultMessageOptions): RoutingMessage {
    return new RoutingMessage(this.message, this.messageRoutingKey, options);
  }
}
