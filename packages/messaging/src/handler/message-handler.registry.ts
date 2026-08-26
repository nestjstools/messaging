import { IMessageHandler } from './i-message.handler';
import { HandlerForMessageNotFoundException } from '../exception/handler-for-message-not-found.exception';
import { MessageHandlerOptions } from '../dependency-injection/decorator';

export class MessageHandlerWrapper<T> {
  constructor(
    public readonly handler: IMessageHandler<T>,
    public readonly priority: number,
  ) {}
}

export class MessageHandlerRegistry {
  private registry: Map<string, MessageHandlerWrapper<any>[]> = new Map();

  register(
    names: string[],
    handler: IMessageHandler<any>,
    options?: MessageHandlerOptions,
  ): void {
    names.forEach((name) => {
      this.registerSingle(name, handler, options?.priority);
    });
  }

  private registerSingle(
    name: string,
    handler: IMessageHandler<any>,
    priority = 0,
  ): void {
    const handlerWrapper = new MessageHandlerWrapper(handler, priority ?? 0);
    if (this.registry.has(name)) {
      const bucket = this.registry.get(name);

      if (bucket.some((wrapper) => wrapper.handler === handler)) {
        return;
      }

      this.registry.get(name).push(handlerWrapper);

      return;
    }

    this.registry.set(name, [handlerWrapper]);
  }

  getByRoutingKey(routingKey: string): MessageHandlerWrapper<any>[] {
    if (!this.registry.has(routingKey)) {
      throw new HandlerForMessageNotFoundException(routingKey);
    }

    return this.registry.get(routingKey);
  }
}
