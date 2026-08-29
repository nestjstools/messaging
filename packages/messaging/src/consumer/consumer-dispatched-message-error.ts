import { ConsumerMessage } from './consumer-message.js';

export class ConsumerDispatchedMessageError {
  constructor(
    public readonly dispatchedConsumerMessage: ConsumerMessage,
    public readonly error: Error,
  ) {}
}
