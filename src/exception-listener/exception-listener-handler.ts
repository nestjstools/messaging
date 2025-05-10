import { Inject, Injectable } from '@nestjs/common';
import { ExceptionListenerRegistry } from './exception-listener.registry';
import { Service } from '../dependency-injection/service';

@Injectable()
export class ExceptionListenerHandler {
  constructor(@Inject(Service.EXCEPTION_LISTENER_REGISTRY) private readonly exceptionListenerRegistry: ExceptionListenerRegistry) {
  }

  async handleError(error: Error, message: object, routingKey: string, channelName: string): Promise<void> {
    this.exceptionListenerRegistry.getAll().forEach(exceptionListener => exceptionListener.onException(error, message, routingKey, channelName));
  }
}
