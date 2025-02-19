import { MessageOptions } from './message-options';

export interface Message {
  message: object|string,
  messageRoutingKey: string,
  messageOptions?: MessageOptions,
}
