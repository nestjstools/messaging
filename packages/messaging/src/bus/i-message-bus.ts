import { Message } from '../message/message.js';

export interface IMessageBus {
  dispatch(message: Message): Promise<object | void>;
}
