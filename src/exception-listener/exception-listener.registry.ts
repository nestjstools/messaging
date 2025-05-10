import { ExceptionListener } from './exception-listener';

export class ExceptionListenerRegistry {
  private registry: Map<string, ExceptionListener> = new Map();

  register(name: string, middleware: ExceptionListener): void {
    if (this.registry.has(name)) {
      return;
    }

    this.registry.set(name, middleware);
  }

  getAll(): ExceptionListener[] {
    return Array.from(this.registry.values());
  }
}
