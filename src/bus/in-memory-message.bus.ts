import { IMessageBus } from './i-message-bus';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { RoutingMessage } from '../message/routing-message';
import { MiddlewareRegistry } from '../middleware/middleware.registry';
import { InMemoryChannel } from '../channel/in-memory.channel';
import { DecoratorExtractor } from '../shared/decorator-extractor';
import { HandlerForMessageNotFoundException } from '../exception/handler-for-message-not-found.exception';

export class InMemoryMessageBus implements IMessageBus {
  constructor(
    private registry: MessageHandlerRegistry,
    private middlewareRegistry: MiddlewareRegistry,
    private channel?: InMemoryChannel,
  ) {}

  async dispatch(message: RoutingMessage): Promise<object | void> {
    const middlewares = [];
    middlewares.push(
      ...(this.channel.config?.middlewares ?? []),
      ...(message.messageOptions?.middlewares ?? []),
    );

    let handlers = [];
    try {
      handlers = this.registry.getByRoutingKey(message.messageRoutingKey);
    } catch (e) {
      if (!(e instanceof HandlerForMessageNotFoundException)) {
        throw e;
      }

      let avoidErrorsForNonExistedHandlers = true;

      if (this.channel instanceof InMemoryChannel && 'default.bus' !== this.channel.config.name) {
        avoidErrorsForNonExistedHandlers = this.channel.config.avoidErrorsForNotExistedHandlers ?? avoidErrorsForNonExistedHandlers;
      } else {
        avoidErrorsForNonExistedHandlers = message.messageOptions?.avoidErrorsWhenNotExistedHandler ?? avoidErrorsForNonExistedHandlers;
      }

      if (avoidErrorsForNonExistedHandlers) {
        return Promise.resolve();
      }

      throw e;
    }

    let response = null;

    for (const handler of handlers) {
      for (const middlewareClass of middlewares) {
        const middleware = this.middlewareRegistry.getByName(
          DecoratorExtractor.extractMessageMiddleware(middlewareClass),
        );
        await middleware.next(message);
      }

      response = await handler.handle(message.message);
    }

    if (response && handlers.length === 1) {
      return response;
    }
  }
}
