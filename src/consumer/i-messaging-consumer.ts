import { ConsumerDispatchedMessageError } from './consumer-dispatched-message-error';
import { ConsumerMessageBus } from '../bus/consumer.message-bus';

export interface IMessagingConsumer<T> {
  consume(dispatcher: ConsumerMessageBus, channel: T): Promise<void>;

  onError(errored: ConsumerDispatchedMessageError, channel: T): Promise<void>;
}
