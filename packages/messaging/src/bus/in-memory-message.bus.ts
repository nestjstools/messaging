import { IMessageBus } from './i-message-bus.js';
import { MessageHandlerRegistry } from '../handler/message-handler.registry.js';
import { MiddlewareRegistry } from '../middleware/middleware.registry.js';
import { InMemoryChannel } from '../channel/in-memory.channel.js';
import { HandlerMiddleware } from '../middleware/handler-middleware.js';
import { MiddlewareContext } from '../middleware/middleware.context.js';
import { DecoratorExtractor } from '../shared/decorator-extractor.js';
import { Middleware } from '../middleware/middleware.js';
import { SealedRoutingMessage } from '../message/sealed-routing-message.js';
import { ObjectForwardMessageNormalizer } from '../normalizer/object-forward-message.normalizer.js';
import { MessageFactory } from '../message/message.factory.js';
import { Message } from '../message/message.js';
import { RoutingMessage } from '../message/routing-message.js';
import { NormalizerRegistry } from '../normalizer/normalizer.registry.js';
import { DefaultMessageOptions } from '../message/default-message-options.js';
import { MessagingLifecycleHookHandler } from '../lifecycle-hook/messaging-lifecycle-hook-handler.js';
import { HookMessage } from '../lifecycle-hook/messaging-lifecycle-hook-listener.js';

export class InMemoryMessageBus implements IMessageBus {
  constructor(
    private registry: MessageHandlerRegistry,
    private middlewareRegistry: MiddlewareRegistry,
    private channel: InMemoryChannel,
    private normalizerRegistry: NormalizerRegistry,
    private messagingHookHandler: MessagingLifecycleHookHandler,
  ) {}

  async dispatch(message: Message): Promise<object | void> {
    const messageOptions =
      message.messageOptions instanceof DefaultMessageOptions
        ? message.messageOptions
        : new DefaultMessageOptions([], true);

    const middlewares = [];
    middlewares.push(
      ...(this.channel.config?.middlewares ?? []),
      ...messageOptions.middlewares,
      HandlerMiddleware,
    );

    let messageToDispatch =
      message instanceof RoutingMessage ? message.message : {};

    if (message instanceof SealedRoutingMessage) {
      // Sealed messages carry raw payload and must be denormalized before dispatch.
      const normalizerDefinition: object =
        messageOptions.normalizer ?? ObjectForwardMessageNormalizer;

      messageToDispatch = await this.normalizerRegistry
        .getByName(normalizerDefinition['name'])
        .denormalize(message.message, message.messageRoutingKey);
    }

    // Hook fired once the payload shape is ready for handler pipeline.
    await this.messagingHookHandler.handleAfterMessageDenormalized(
      HookMessage.fromRoutingMessage(
        MessageFactory.creteRoutingFromMessage(messageToDispatch, message),
      ),
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
          messageOptions.avoidErrorsWhenNotExistedHandler ??
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
      HookMessage.fromRoutingMessage(
        MessageFactory.creteRoutingFromMessage(messageToDispatch, message),
      ),
    );

    const response = await middlewareInstances[0].process(
      MessageFactory.creteRoutingFromMessage(messageToDispatch, message),
      context,
    );

    await this.messagingHookHandler.handleAfterMessageHandlerExecuted(
      HookMessage.fromRoutingMessage(
        MessageFactory.creteRoutingFromMessage(messageToDispatch, message),
      ),
    );

    return Promise.resolve(response);
  }
}
