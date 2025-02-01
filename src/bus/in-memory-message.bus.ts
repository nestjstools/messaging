import { IMessageBus } from './i-message-bus';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { RoutingMessage } from '../message/routing-message';
import { MiddlewareRegistry } from '../middleware/middleware.registry';
import { InMemoryChannel } from '../channel/in-memory.channel';
import { HandlerMiddleware } from '../middleware/handler-middleware';
import { MiddlewareContext } from '../middleware/middleware.context';
import { DecoratorExtractor } from '../shared/decorator-extractor';
import { Middleware } from '../middleware/middleware';

export class InMemoryMessageBus implements IMessageBus {
  constructor(
    private registry: MessageHandlerRegistry,
    private middlewareRegistry: MiddlewareRegistry,
    private channel: InMemoryChannel,
  ) {}

  async dispatch(message: RoutingMessage): Promise<object | void> {
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

    const middlewareInstances: Middleware[] = middlewares.map(middleware => this.middlewareRegistry.getByName(
      DecoratorExtractor.extractMessageMiddleware(middleware),
    ));
    const context = await MiddlewareContext.createFresh(middlewareInstances);
    const response = await middlewareInstances[0].process(message, context);

    return Promise.resolve(response);
  }
}
