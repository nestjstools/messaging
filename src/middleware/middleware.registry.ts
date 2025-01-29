import { Middleware } from './middleware';
import { MessagingException } from '../exception/messaging.exception';

export class MiddlewareRegistry {
  private registry: Map<string, Middleware> = new Map();

  register(name: string, middleware: Middleware): void {
    if (this.registry.has(name)) {
      return;
    }

    this.registry.set(name, middleware);
  }

  getByName(name: string): Middleware {
    if (!this.registry.has(name)) {
      throw new MessagingException(`There is no middleware with name: ${name}`);
    }

    return this.registry.get(name);
  }

  getAll(): Middleware[] {
    return Array.from(this.registry.values());
  }
}
