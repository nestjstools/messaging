import { IMessageBus } from './i-message-bus.js';

export interface IMessageBusFactory<T> {
  create(channel: T): IMessageBus;
}
