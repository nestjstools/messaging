import { RoutingMessage } from '../message/routing-message';
import { ConsumerMessage } from '../consumer/consumer-message';

export type MessagingData = RoutingMessage | ConsumerMessage | DetailedConsumerMessage;

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

  static fromConsumerMessage(consumerMessage: ConsumerMessage, channelName: string, channelType: string): DetailedConsumerMessage {
    return new DetailedConsumerMessage(
      consumerMessage.message,
      consumerMessage.routingKey,
      consumerMessage.metadata,
      channelName,
      channelType,
    );
  }
}

export enum LifecycleHook {
  AFTER_MESSAGE_DENORMALIZED = 'AFTER_MESSAGE_DENORMALIZED',
  BEFORE_MESSAGE_HANDLER = 'BEFORE_MESSAGE_HANDLER',
  AFTER_MESSAGE_HANDLER_EXECUTED = 'AFTER_MESSAGE_HANDLER_EXECUTED',
  ON_FAILED_MESSAGE_CONSUMER = 'ON_FAILED_MESSAGE_CONSUMER',
}

export interface MessagingLifecycleHookListener {
  hook(data: MessagingData): Promise<void>;
}
