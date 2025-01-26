import { ConsumerMessageDispatcher } from './consumer-message-dispatcher';
import { Channel } from '../channel/channel';
import { ConsumerDispatchedMessageError } from './consumer-dispatched-message-error';

export interface IMessagingConsumer {
  consume(
    dispatcher: ConsumerMessageDispatcher,
    channel: Channel,
  ): Promise<void>;

  onError(
    errored: ConsumerDispatchedMessageError,
    channel: Channel,
  ): Promise<void>;
}
