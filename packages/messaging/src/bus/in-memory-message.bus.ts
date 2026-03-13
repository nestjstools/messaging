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

export class InMemoryMessageBus implements IMessageBus {
  constructor(
    private registry: MessageHandlerRegistry,
    private middlewareRegistry: MiddlewareRegistry,
    private channel: InMemoryChannel,
    private normalizerRegistry: NormalizerRegistry,
  ) {}

  async dispatch(message: Message): Promise<object | void> {
    const middlewares = [];
    middlewares.push(
      ...(this.channel.config?.middlewares ?? []),
      ...(message.messageOptions?.middlewares ?? []),
      HandlerMiddleware,
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

    let messageToDispatch =
      message instanceof RoutingMessage ? message.message : {};

    if (message instanceof SealedRoutingMessage) {
      let normalizerDefinition: object = (
        message.messageOptions instanceof DefaultMessageOptions
          ? message.messageOptions.normalizer
          : ObjectForwardMessageNormalizer
      ) as object;

      messageToDispatch = await this.normalizerRegistry
        .getByName(normalizerDefinition['name'])
        .denormalize(message.message, message.messageRoutingKey);
    }

    const response = await middlewareInstances[0].process(
      MessageFactory.creteRoutingFromMessage(messageToDispatch, message),
      context,
    );

    return Promise.resolve(response);
  }
}
