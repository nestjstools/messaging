import { IMessageHandler } from './i-message.handler';
import { DecoratorExtractor } from '../shared/decorator-extractor';
import { HandlerForMessageNotFoundException } from '../exception/handler-for-message-not-found.exception';

export class MessageHandlerRegistry {
  private registry: Map<string, IMessageHandler<any>[]> = new Map();

  register(handler: IMessageHandler<any>): void {
    const name = DecoratorExtractor.extractMessageHandler(handler);

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
