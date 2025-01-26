import { ConsumerMessage } from './consumer-message';

export class ConsumerDispatchedMessageError {
  constructor(
    public readonly dispatchedConsumerMessage: ConsumerMessage,
    public readonly error: Error,
  ) {}
}
