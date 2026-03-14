import { IMessageBus } from './i-message-bus';

export interface IMessageBusFactory<T> {
  create(channel: T): IMessageBus;
}
