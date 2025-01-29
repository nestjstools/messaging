import { MessagingException } from './messaging.exception';

export class HandlerForMessageNotFoundException extends MessagingException {
  constructor(routingKey: string) {
    super(`There is no handlers for this routing key: [${routingKey}]`);
  }
}
