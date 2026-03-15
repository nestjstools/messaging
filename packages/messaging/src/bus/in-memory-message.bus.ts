import { IMessageBus } from './i-message-bus';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { MiddlewareRegistry } from '../middleware/middleware.registry';
import { InMemoryChannel } from '../channel/in-memory.channel';
import { HandlerMiddleware } from '../middleware/handler-middleware';
import { MiddlewareContext } from '../middleware/middleware.context';
import { DecoratorExtractor } from '../shared/decorator-extractor';
import { Middleware } from '../middleware/middleware';
import { SealedRoutingMessage } from '../message/sealed-routing-message';
import { ObjectForwardMessageNormalizer } from '../normalizer/object-forward-message.normalizer';
import { MessageFactory } from '../message/message.factory';
import { Message } from '../message/message';
import { RoutingMessage } from '../message/routing-message';
import { NormalizerRegistry } from '../normalizer/normalizer.registry';
import { DefaultMessageOptions } from '../message/default-message-options';
import { MessagingLifecycleHookHandler } from '../lifecycle-hook/messaging-lifecycle-hook-handler';

export class InMemoryMessageBus implements IMessageBus {
  constructor(
    private registry: MessageHandlerRegistry,
    private middlewareRegistry: MiddlewareRegistry,
    private channel: InMemoryChannel,
    private normalizerRegistry: NormalizerRegistry,
    private messagingHookHandler: MessagingLifecycleHookHandler,
  ) {
  }

  async dispatch(message: Message): Promise<object | void> {
    const middlewares = [];
    // Execution order: channel middlewares -> message middlewares -> handler middleware.
    middlewares.push(
      ...(this.channel.config?.middlewares ?? []),
      ...(message.messageOptions?.middlewares ?? []),
      HandlerMiddleware,
    );

    let messageToDispatch =
      message instanceof RoutingMessage ? message.message : {};

    if (message instanceof SealedRoutingMessage) {
      // Sealed messages carry raw payload and must be denormalized before dispatch.
      const normalizerDefinition: object =
        message.messageOptions instanceof DefaultMessageOptions
          ? message.messageOptions.normalizer
          : ObjectForwardMessageNormalizer;

      messageToDispatch = await this.normalizerRegistry
        .getByName(normalizerDefinition['name'])
        .denormalize(message.message, message.messageRoutingKey);
    }

    // Hook fired once the payload shape is ready for handler pipeline.
    await this.messagingHookHandler.handleAfterMessageDenormalized(
      MessageFactory.creteRoutingFromMessage(messageToDispatch, message),
    );

    try {
      this.registry.getByRoutingKey(message.messageRoutingKey);
    } catch (e) {
      let avoidErrorsForNonExistedHandlers = true;

      if (
        this.channel instanceof InMemoryChannel &&
        'default.bus' !== this.channel.config.name
      ) {
        avoidErrorsForNonExistedHandlers =
          this.channel.config.avoidErrorsForNotExistedHandlers ??
          avoidErrorsForNonExistedHandlers;
      } else {
        avoidErrorsForNonExistedHandlers =
          message.messageOptions?.avoidErrorsWhenNotExistedHandler ??
          avoidErrorsForNonExistedHandlers;
      }

      // Missing handler can be configured as no-op for fire-and-forget scenarios.
      if (avoidErrorsForNonExistedHandlers) {
        return Promise.resolve();
      }

      throw e;
    }

    const middlewareInstances: Middleware[] = middlewares.map((middleware) =>
      this.middlewareRegistry.getByName(
        DecoratorExtractor.extractMessageMiddleware(middleware),
      ),
    );

    const context = MiddlewareContext.createFresh(middlewareInstances);

    // Hook around handler execution.
    await this.messagingHookHandler.handleBeforeMessageHandler(
      MessageFactory.creteRoutingFromMessage(messageToDispatch, message),
    );

    const response = await middlewareInstances[0].process(
      MessageFactory.creteRoutingFromMessage(messageToDispatch, message),
      context,
    );

    await this.messagingHookHandler.handleAfterMessageHandlerExecuted(
      MessageFactory.creteRoutingFromMessage(messageToDispatch, message),
    );

    return Promise.resolve(response);
  }
}
