import { IMessageHandler } from './i-message.handler';
import { HandlerForMessageNotFoundException } from '../exception/handler-for-message-not-found.exception';

export class MessageHandlerRegistry {
  private registry: Map<string, IMessageHandler<any>[]> = new Map();

  register(names: string[], handler: IMessageHandler<any>): void {
    names.forEach((name) => {
      this.registerSingle(name, handler);
    });
  }

  private registerSingle(name: string, handler: IMessageHandler<any>): void {
    if (this.registry.has(name)) {
      const bucket = this.registry.get(name) as Array<IMessageHandler<any>>;

      if (bucket.includes(handler)) {
        return;
      }

      this.registry.get(name).push(handler);

      return;
    }

    this.registry.set(name, [handler]);
  }

  getByRoutingKey(routingKey: string): IMessageHandler<any>[] {
    if (!this.registry.has(routingKey)) {
      throw new HandlerForMessageNotFoundException(routingKey);
    }

    return this.registry.get(routingKey);
  }
}
