import { RoutingMessage } from '../message/routing-message';
import { Middleware } from './middleware';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { Inject, Injectable } from '@nestjs/common';
import { Service } from '../dependency-injection/service';
import { MessagingMiddleware } from '../dependency-injection/decorator';
import { MiddlewareContext } from './middleware.context';
import { IMessageHandler } from '../handler/i-message.handler';
import { Log } from '../logger/log';
import { MessagingLogger } from '../logger/messaging-logger';
import { HandlerError, HandlersException } from '../exception/handlers.exception';

@Injectable()
@MessagingMiddleware()
export class HandlerMiddleware implements Middleware {
  constructor(
    @Inject(Service.MESSAGE_HANDLERS_REGISTRY)
    private handlerRegistry: MessageHandlerRegistry,
    @Inject(Service.LOGGER)
    private logger: MessagingLogger,
  ) {}

  async process(message: RoutingMessage, context: MiddlewareContext): Promise<any> {
    const handlers = this.handlerRegistry.getByRoutingKey(message.messageRoutingKey);

    return Promise.resolve(await this.handleParallel(message, handlers));
  }

  private async handleParallel(message: RoutingMessage, handlers: IMessageHandler<any>[]): Promise<any> {
    const errors: HandlerError[] = [];

    if (1 === handlers.length) {
      const handler = handlers[0];
      this.logHandlerMessage(handler.constructor.name, message.messageRoutingKey, message.message);
      return Promise.resolve(await handler.handle(message.message));
    }

    const results = await Promise.allSettled(
      handlers.map(handler => {
        try {
          this.logHandlerMessage(handler.constructor.name, message.messageRoutingKey, message.message);
          return handler.handle(message.message);
        } catch (err) {
          return Promise.reject({handler: handler.constructor.name, error: err});
        }
      })
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        const exception = result.reason.error;
        this.logger.error(Log.create(`Some error occurred in Handler [${result.reason.handler}]`, {
          error: exception.message,
          exception,
          message: JSON.stringify(message.message),
        }));
        errors.push(new HandlerError(result.reason.handler, exception));
      }
    }

    if (errors.length > 0) {
      throw new HandlersException(errors);
    }

    return Promise.resolve(null);
  }

  private logHandlerMessage(handler: string, messageRoutingKey: string, message: object): void {
    this.logger.debug(Log.create(`Found a handler [${handler}] for message [${messageRoutingKey}]`));
  }
}
