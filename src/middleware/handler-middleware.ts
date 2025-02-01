import { RoutingMessage } from '../message/routing-message';
import { Middleware } from './middleware';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { Inject, Injectable } from '@nestjs/common';
import { Service } from '../dependency-injection/service';
import { MessagingMiddleware } from '../dependency-injection/decorator';

@Injectable()
@MessagingMiddleware('HandlerMiddleware')
export class HandlerMiddleware implements Middleware {
  constructor(
    @Inject(Service.MESSAGE_HANDLERS_REGISTRY)
    private handlerRegistry: MessageHandlerRegistry,
  ) {}

  async next(next: RoutingMessage): Promise<RoutingMessage> {
    const handlers = this.handlerRegistry.getByRoutingKey(next.messageRoutingKey);
    let response = null;

    for (const handler of handlers) {
      response = await handler.handle(next.message);
    }

    if (response && handlers.length === 1) {
      return response;
    }

    return Promise.resolve(response);
  }
}
