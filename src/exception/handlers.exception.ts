import { MessagingException } from './messaging.exception';

export class HandlersException extends MessagingException {
  constructor(public readonly errors: HandlerError[]) {
    super(`Encountered [${errors.length}] error(s) during handler execution`);
  }
}

export class HandlerError {
  public readonly errorMessage: string;

  constructor(
    public readonly handler: string,
    public readonly error: Error,
  ) {
    this.handler = handler;
    this.error = error;
    this.errorMessage = error.message;
  }
}
