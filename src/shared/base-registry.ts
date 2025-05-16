import { Registry } from './registry';
import { MessagingException } from '../exception/messaging.exception';

export abstract class BaseRegistry<T extends object> implements Registry<T> {
  private registry: Map<string, T> = new Map();

  register(name: string, middleware: T): void {
    if (this.registry.has(name)) {
      return;
    }

    this.registry.set(name, middleware);
  }

  getByName(name: string): T {
    if (!this.registry.has(name)) {
      throw new MessagingException(`There is no element in registry with name: ${name}`);
    }

    return this.registry.get(name);
  }

  getAll(): T[] {
    return Array.from(this.registry.values());
  }
}
