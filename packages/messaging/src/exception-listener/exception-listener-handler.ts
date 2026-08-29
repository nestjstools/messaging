import { Inject, Injectable } from '@nestjs/common';
import { ExceptionListenerRegistry } from './exception-listener.registry.js';
import { Service } from '../dependency-injection/service.js';
import { ExceptionContext } from './exception-context.js';

@Injectable()
export class ExceptionListenerHandler {
  constructor(
    @Inject(Service.EXCEPTION_LISTENER_REGISTRY)
    private readonly exceptionListenerRegistry: ExceptionListenerRegistry,
  ) {}

  async handleError(context: ExceptionContext): Promise<void> {
    await this.exceptionListenerRegistry
      .getAll()
      .forEach((exceptionListener) => exceptionListener.onException(context));
  }
}
