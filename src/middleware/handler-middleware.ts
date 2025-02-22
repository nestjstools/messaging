import { RoutingMessage } from '../message/routing-message';
import { Middleware } from './middleware';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { Inject, Injectable } from '@nestjs/common';
import { Service } from '../dependency-injection/service';
import { MessagingMiddleware } from '../dependency-injection/decorator';
import { MiddlewareContext } from './middleware.context';

@Injectable()
@MessagingMiddleware()
export class HandlerMiddleware implements Middleware {
  constructor(
    @Inject(Service.MESSAGE_HANDLERS_REGISTRY)
    private handlerRegistry: MessageHandlerRegistry,
  ) {}

  async process(message: RoutingMessage, context: MiddlewareContext): Promise<any> {
    const handlers = this.handlerRegistry.getByRoutingKey(message.messageRoutingKey);
    let response = null;

    for (const handler of handlers) {
      response = await handler.handle(message.message);
    }

    return Promise.resolve(response);
  }
}
