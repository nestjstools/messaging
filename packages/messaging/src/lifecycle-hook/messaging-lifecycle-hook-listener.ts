import { ConsumerMessage } from '../consumer/consumer-message';
import { RoutingMessage } from '../message/routing-message';
import { SealedRoutingMessage } from '../message/sealed-routing-message';

export class HookMessage<T = any> {
  constructor(
    public readonly message: T,
    public readonly routingKey: string,
    public readonly channelName?: string,
    public readonly channelType?: string,
  ) {}

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
    channelName?: string,
    channelType?: string,
  ): HookMessage {
    return new HookMessage(
      routingMessage.message,
      routingMessage.messageRoutingKey,
      channelName,
      channelType,
    );
  }

  static fromSealedRoutingMessage(
    routingMessage: SealedRoutingMessage,
    channelName?: string,
    channelType?: string,
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
  ON_CONSUMER_HANDLED_MESSAGE = 'ON_CONSUMER_HANDLED_MESSAGE',
  AFTER_MESSAGE_DENORMALIZED = 'AFTER_MESSAGE_DENORMALIZED',
  BEFORE_MESSAGE_HANDLER = 'BEFORE_MESSAGE_HANDLER',
  AFTER_MESSAGE_HANDLER_EXECUTION = 'AFTER_MESSAGE_HANDLER_EXECUTION',
  ON_FAILED_MESSAGE_CONSUMER = 'ON_FAILED_MESSAGE_CONSUMER',
}

export interface MessagingLifecycleHookListener {
  hook(message: HookMessage): Promise<void>;
}
