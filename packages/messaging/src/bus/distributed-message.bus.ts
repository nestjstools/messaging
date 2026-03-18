import { Injectable } from '@nestjs/common';
import { MessageResponse } from '../message/message-response';
import { IMessageBus } from './i-message-bus';
import { MessageBusCollection } from './message-bus.collection';
import { RoutingMessage } from '../message/routing-message';
import { MessageFactory } from '../message/message.factory';
import { NormalizerRegistry } from '../normalizer/normalizer.registry';
import { MessagingLifecycleHookHandler } from '../lifecycle-hook/messaging-lifecycle-hook-handler';
import { HookMessage } from '../lifecycle-hook/messaging-lifecycle-hook-listener';

@Injectable()
export class DistributedMessageBus implements IMessageBus {
  constructor(
    private messageBusCollection: MessageBusCollection,
    private normalizerRegistry: NormalizerRegistry,
    private messagingLifecycleHookHandler: MessagingLifecycleHookHandler,
  ) {
  }

  async dispatch(message: RoutingMessage): Promise<MessageResponse> {
    if (!(message instanceof RoutingMessage)) {
      throw new Error(`Message must be instance of ${RoutingMessage.name}`);
    }

    const response = [];
    for (const collection of this.messageBusCollection.getAll()) {
      await this.messagingLifecycleHookHandler.handleBeforeMessageNormalization(
        HookMessage.fromRoutingMessage(
          message,
          collection.channel.config.name,
          collection.channel.constructor.name,
        ),
      );

      const normalizedMessage = await this.normalizerRegistry
        .getByName(collection.channel.config.normalizer.name)
        .normalize(message.message, message.messageRoutingKey);

      await this.messagingLifecycleHookHandler.handleAfterMessageNormalization(
        HookMessage.fromRoutingMessage(
          message,
          collection.channel.config.name,
          collection.channel.constructor.name,
        ),
      );

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
