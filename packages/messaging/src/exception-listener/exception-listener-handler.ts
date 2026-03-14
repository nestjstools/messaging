import { Inject, Injectable } from '@nestjs/common';
import { ExceptionListenerRegistry } from './exception-listener.registry';
import { Service } from '../dependency-injection/service';
import { ExceptionContext } from './exception-context';

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
