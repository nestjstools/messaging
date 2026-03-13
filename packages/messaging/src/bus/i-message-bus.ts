import { Message } from '../message/message';

export interface IMessageBus {
  dispatch(message: Message): Promise<object | void>;
}
