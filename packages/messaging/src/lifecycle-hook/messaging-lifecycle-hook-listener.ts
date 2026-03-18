import { RoutingMessage } from '../message/routing-message';
import { ConsumerMessage } from '../consumer/consumer-message';

export type MessagingData =
  | RoutingMessage
  | ConsumerMessage
  | DetailedConsumerMessage
  | MessageBusMessage;

export class DetailedConsumerMessage extends ConsumerMessage {
  constructor(
    public readonly message: object | string,
    public readonly routingKey: string,
    public readonly metadata: Record<string, any> = {},
    public readonly channelName: string,
    public readonly channelType: string,
  ) {
    super(message, routingKey, metadata);
  }

  static fromConsumerMessage(
    consumerMessage: ConsumerMessage,
    channelName: string,
    channelType: string,
  ): DetailedConsumerMessage {
    return new DetailedConsumerMessage(
      consumerMessage.message,
      consumerMessage.routingKey,
      consumerMessage.metadata,
      channelName,
      channelType,
    );
  }
}

export class MessageBusMessage<T = any> {
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
  ): MessageBusMessage<T> {
    return new MessageBusMessage(message, routingKey, channelName, channelType);
  }
}

export enum LifecycleHook {
  BEFORE_MESSAGE_NORMALIZATION = 'BEFORE_MESSAGE_NORMALIZATION',
  AFTER_MESSAGE_NORMALIZATION = 'AFTER_MESSAGE_NORMALIZATION',
  AFTER_MESSAGE_DENORMALIZED = 'AFTER_MESSAGE_DENORMALIZED',
  BEFORE_MESSAGE_HANDLER = 'BEFORE_MESSAGE_HANDLER',
  AFTER_MESSAGE_HANDLER_EXECUTED = 'AFTER_MESSAGE_HANDLER_EXECUTED',
  ON_FAILED_MESSAGE_CONSUMER = 'ON_FAILED_MESSAGE_CONSUMER',
}

export interface MessagingLifecycleHookListener {
  hook(data: MessagingData): Promise<void>;
}
