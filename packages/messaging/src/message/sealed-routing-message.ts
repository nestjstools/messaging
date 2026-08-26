import { DefaultMessageOptions } from './default-message-options';
import { Message } from './message';

export class SealedRoutingMessage implements Message {
  constructor(
    public readonly message: object | string,
    public readonly messageRoutingKey: string,
    public readonly messageOptions?: unknown,
  ) {}

  createWithOptions(options: DefaultMessageOptions): SealedRoutingMessage {
    return new SealedRoutingMessage(
      this.message,
      this.messageRoutingKey,
      options,
    );
  }
}
