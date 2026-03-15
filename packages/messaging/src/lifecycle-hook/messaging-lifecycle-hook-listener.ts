import { RoutingMessage } from '../message/routing-message';

export type MessagingData = RoutingMessage;

export enum LifecycleHook {
  AFTER_MESSAGE_DENORMALIZED = 'AFTER_MESSAGE_DENORMALIZED',
  BEFORE_MESSAGE_HANDLER = 'BEFORE_MESSAGE_HANDLER',
  AFTER_MESSAGE_HANDLER_EXECUTED = 'AFTER_MESSAGE_HANDLER_EXECUTED',
}

export interface MessagingLifecycleHookListener {
  on(data: MessagingData): Promise<void>;
}
