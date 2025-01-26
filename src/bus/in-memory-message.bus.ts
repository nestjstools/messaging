import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {IMessageBus} from "./i-message-bus";
import {MessageHandlerRegistry} from "../handler/message-handler.registry";
import {Service} from "../dependency-injection/service";
import {RoutingMessage} from "../message/routing-message";
import {ClassNameProvider} from "../shared/class-name.provider";

@Injectable()
export class InMemoryMessageBus implements IMessageBus {
  constructor(
    @Inject(Service.MESSAGE_HANDLERS_REGISTRY) private registry: MessageHandlerRegistry,
    private readonly moduleRef: ModuleRef,
  ) {
  }

  async dispatch(message: RoutingMessage): Promise<object | void> {
    const handlers = this.registry.getByRoutingKey(message.messageRoutingKey);
    let response = null;

    for (const handlerClass of handlers) {
      //@ts-ignore
      const handler = this.moduleRef.get(handlerClass as string);

      let messageReference = message;

      if (message.messageOptions?.middlewares) {
        for (const middlewareClass of message.messageOptions.middlewares) {
          const middleware = this.moduleRef.get(ClassNameProvider.getClassName(middlewareClass));
          messageReference = await middleware.next(message);
        }
      }

      response = await handler.handle(messageReference.message);
    }

    if (response && handlers.length === 1) {
      return response;
    }
  }
}
