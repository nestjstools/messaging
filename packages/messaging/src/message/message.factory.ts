import { Message } from './message.js';
import { SealedRoutingMessage } from './sealed-routing-message.js';
import { RoutingMessage } from './routing-message.js';

export class MessageFactory {
  static creteSealedFromMessage(
    message: object | string,
    fromMessage: Message,
  ): SealedRoutingMessage {
    return new SealedRoutingMessage(
      message,
      fromMessage.messageRoutingKey,
      fromMessage.messageOptions,
    );
  }

  static creteRoutingFromMessage(
    message: object,
    fromMessage: Message,
  ): RoutingMessage {
    return new RoutingMessage(
      message,
      fromMessage.messageRoutingKey,
      fromMessage.messageOptions,
    );
  }
}
