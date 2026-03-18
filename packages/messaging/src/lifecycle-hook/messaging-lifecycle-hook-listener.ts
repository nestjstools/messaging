import { ConsumerMessage } from '../consumer/consumer-message';
import { RoutingMessage } from '../message/routing-message';

export class HookMessage<T = any> {
  constructor(
    public readonly message: T,
    public readonly routingKey: string,
    public readonly channelName: string,
    public readonly channelType: string,
  ) {}

  static fromMessage<T>(
    message: T,
    routingKey: string,
    channelName: string,
    channelType: string,
  ): HookMessage<T> {
    return new HookMessage(message, routingKey, channelName, channelType);
  }

  static fromConsumerMessage(
    consumerMessage: ConsumerMessage,
    channelName: string,
    channelType: string,
  ): HookMessage {
    return new HookMessage(
      consumerMessage.message,
      consumerMessage.routingKey,
      channelName,
      channelType,
    );
  }

  static fromRoutingMessage(
    routingMessage: RoutingMessage,
    channelName: string,
    channelType: string,
  ): HookMessage {
    return new HookMessage(
      routingMessage.message,
      routingMessage.messageRoutingKey,
      channelName,
      channelType,
    );
  }
}

export enum LifecycleHook {
  BEFORE_MESSAGE_NORMALIZATION = 'BEFORE_MESSAGE_NORMALIZATION',
  AFTER_MESSAGE_NORMALIZATION = 'AFTER_MESSAGE_NORMALIZATION',
  AFTER_MESSAGE_DENORMALIZED = 'AFTER_MESSAGE_DENORMALIZED',
  BEFORE_MESSAGE_HANDLER = 'BEFORE_MESSAGE_HANDLER',
  AFTER_MESSAGE_HANDLER_EXECUTION = 'AFTER_MESSAGE_HANDLER_EXECUTION',
  ON_FAILED_MESSAGE_CONSUMER = 'ON_FAILED_MESSAGE_CONSUMER',
}

export interface MessagingLifecycleHookListener {
  hook(message: HookMessage): Promise<void>;
}
