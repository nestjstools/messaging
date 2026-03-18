import { Injectable } from '@nestjs/common';
import { MessagingLifecycleHookRegistry } from './messaging-lifecycle-hook.registry';
import {
  LifecycleHook,
  MessageBusMessage,
} from './messaging-lifecycle-hook-listener';
import { RoutingMessage } from '../message/routing-message';
import { ConsumerMessage } from '../consumer/consumer-message';

@Injectable()
export class MessagingLifecycleHookHandler {
  constructor(
    private readonly messagingHookRegistry: MessagingLifecycleHookRegistry,
  ) {}

  async handleAfterMessageDenormalized(message: RoutingMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.AFTER_MESSAGE_DENORMALIZED)
      .forEach((listener) => listener.hook(message));
  }

  async handleBeforeMessageHandler(message: RoutingMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.BEFORE_MESSAGE_HANDLER)
      .forEach((listener) => listener.hook(message));
  }

  async handleAfterMessageHandlerExecuted(
    message: RoutingMessage,
  ): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.AFTER_MESSAGE_HANDLER_EXECUTED)
      .forEach((listener) => listener.hook(message));
  }

  async handleOnFailedMessageConsumer(message: ConsumerMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.ON_FAILED_MESSAGE_CONSUMER)
      .forEach((listener) => listener.hook(message));
  }

  async handleBeforeMessageNormalization(
    message: MessageBusMessage,
  ): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.BEFORE_MESSAGE_NORMALIZATION)
      .forEach((listener) => listener.hook(message));
  }

  async handleAfterMessageNormalization(
    message: MessageBusMessage,
  ): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.AFTER_MESSAGE_NORMALIZATION)
      .forEach((listener) => listener.hook(message));
  }
}
