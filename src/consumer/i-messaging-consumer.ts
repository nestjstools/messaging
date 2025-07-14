import { ConsumerMessageDispatcher } from './consumer-message-dispatcher';
import { ConsumerDispatchedMessageError } from './consumer-dispatched-message-error';

export interface IMessagingConsumer<T> {
  consume(dispatcher: ConsumerMessageDispatcher, channel: T): Promise<void>;

  onError(errored: ConsumerDispatchedMessageError, channel: T): Promise<void>;
}
