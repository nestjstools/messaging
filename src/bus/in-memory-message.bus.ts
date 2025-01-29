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

      if (this.channel.config?.avoidErrorsForNotExistedHandlers ?? true) {
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
