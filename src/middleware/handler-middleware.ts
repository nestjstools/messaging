import { RoutingMessage } from '../message/routing-message';
import { Middleware } from './middleware';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { Inject, Injectable } from '@nestjs/common';
import { Service } from '../dependency-injection/service';
import { MESSAGING_MESSAGE_METADATA, MessagingMiddleware } from '../dependency-injection/decorator';
import { MiddlewareContext } from './middleware.context';
import { IMessageHandler } from '../handler/i-message.handler';
import { Log } from '../logger/log';
import { MessagingLogger } from '../logger/messaging-logger';
import { HandlerError, HandlersException } from '../exception/handlers.exception';
import { plainToInstance } from 'class-transformer';

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

    return this.handleParallel(message, handlers);
  }

  private async handleParallel(message: RoutingMessage, handlers: IMessageHandler<any>[]): Promise<any> {
    const errors: HandlerError[] = [];

    if (1 === handlers.length) {
      const handler = handlers[0];
      this.logHandlerMessage(handler.constructor.name, message.messageRoutingKey);
      try {
        const metadata = Reflect.getMetadata(MESSAGING_MESSAGE_METADATA, handler, 'handle');
        const result = await handler.handle(plainToInstance(metadata, message.message));
        return Promise.resolve(result);
      } catch (error) {
        const exception = new HandlersException([new HandlerError(handler.constructor.name, error)]);
        this.logHandlerErrorMessage(handler.constructor.name, message, exception);
        return Promise.reject(exception);
      }
    }

    const results = await Promise.allSettled(
      handlers.map(handler => {
        try {
          this.logHandlerMessage(handler.constructor.name, message.messageRoutingKey);
          return handler.handle(message.message);
        } catch (err) {
          return Promise.reject({handler: handler.constructor.name, error: err});
        }
      })
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        const exception = result.reason.error;
        this.logHandlerErrorMessage(result.reason.handler, message, exception);
        errors.push(new HandlerError(result.reason.handler, exception));
      }
    }

    if (errors.length > 0) {
      throw new HandlersException(errors);
    }

    return Promise.resolve(null);
  }

  private logHandlerMessage(handler: string, messageRoutingKey: string): void {
    this.logger.debug(Log.create(`Found a handler [${handler}] for message [${messageRoutingKey}]`));
  }

  private logHandlerErrorMessage(handler: string, message: RoutingMessage, exception: Error): void {
    this.logger.error(Log.create(`Some error occurred in Handler [${handler}]`, {
      error: exception.message,
      exception,
      message: JSON.stringify(message.message),
    }));
  }
}
