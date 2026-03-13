import { Injectable } from '@nestjs/common';
import { MessageResponse } from '../message/message-response';
import { IMessageBus } from './i-message-bus';
import { MessageBusCollection } from './message-bus.collection';
import { RoutingMessage } from '../message/routing-message';
import { MessageFactory } from '../message/message.factory';
import { NormalizerRegistry } from '../normalizer/normalizer.registry';

@Injectable()
export class DistributedMessageBus implements IMessageBus {
  constructor(
    private messageBusCollection: MessageBusCollection,
    private normalizerRegistry: NormalizerRegistry,
  ) {}

  async dispatch(message: RoutingMessage): Promise<MessageResponse> {
    if (!(message instanceof RoutingMessage)) {
      throw new Error(`Message must be instance of ${RoutingMessage.name}`);
    }

    const response = [];
    for (const collection of this.messageBusCollection.getAll()) {
      const normalizedMessage = await this.normalizerRegistry
        .getByName(collection.channel.config.normalizer.name)
        .normalize(message.message, message.messageRoutingKey);
      const handlerResponse = await collection.messageBus.dispatch(
        MessageFactory.creteSealedFromMessage(normalizedMessage, message),
      );
      if (handlerResponse) {
        response.push(handlerResponse);
      }
    }

    return new MessageResponse(response);
  }
}
