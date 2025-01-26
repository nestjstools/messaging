import { Injectable } from '@nestjs/common';
import {MessageResponse} from "../message/message-response";
import {RoutingMessage} from "../message/routing-message";
import {IMessageBus} from "./i-message-bus";

@Injectable()
export class DistributedMessageBus implements IMessageBus {
  constructor(private messageBuses: IMessageBus[]) {}

  async dispatch(message: RoutingMessage): Promise<MessageResponse | void> {
    const response = []
    for (const bus of this.messageBuses) {
      const handlerResponse = await bus.dispatch(message);
      if (handlerResponse) {
        response.push(handlerResponse);
      }
    }

    return new MessageResponse(response);
  }
}
