import { ConsumerMessage } from './consumer-message';

export interface ConsumerMessageDispatcher {
  dispatch(message: ConsumerMessage): void;
}
