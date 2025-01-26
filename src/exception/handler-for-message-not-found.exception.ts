export class HandlerForMessageNotFoundException extends Error {
  constructor(routingKey: string) {
    super(`There is no handlers for this routing key: [${routingKey}]`);
  }
}
