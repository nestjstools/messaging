import { Injectable } from '@nestjs/common';
import { MessagingLifecycleHookRegistry } from './messaging-lifecycle-hook.registry';
import {
  LifecycleHook,
  HookMessage,
} from './messaging-lifecycle-hook-listener';

@Injectable()
export class MessagingLifecycleHookHandler {
  constructor(
    private readonly messagingHookRegistry: MessagingLifecycleHookRegistry,
  ) {}

  async handleAfterMessageDenormalized(message: HookMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.AFTER_MESSAGE_DENORMALIZED)
      .forEach((listener) => listener.hook(message));
  }

  async handleBeforeMessageHandler(message: HookMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.BEFORE_MESSAGE_HANDLER)
      .forEach((listener) => listener.hook(message));
  }

  async handleAfterMessageHandlerExecuted(message: HookMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.AFTER_MESSAGE_HANDLER_EXECUTION)
      .forEach((listener) => listener.hook(message));
  }

  async handleOnFailedMessageConsumer(message: HookMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.ON_FAILED_MESSAGE_CONSUMER)
      .forEach((listener) => listener.hook(message));
  }

  async handleBeforeMessageNormalization(message: HookMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.BEFORE_MESSAGE_NORMALIZATION)
      .forEach((listener) => listener.hook(message));
  }

  async handleAfterMessageNormalization(message: HookMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.AFTER_MESSAGE_NORMALIZATION)
      .forEach((listener) => listener.hook(message));
  }
}
