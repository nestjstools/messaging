import { Message } from '../message/message';

export type MessagingData = Message;

export enum MessagingListenerHook {
  PRE_MESSAGE_DISPATCHED = 'PRE_MESSAGE_DISPATCHED',
  POST_MESSAGE_DISPATCHED = 'POST_MESSAGE_DISPATCHED',
}

export interface MessagingListener {
  on(data: MessagingData): Promise<void>;
}
