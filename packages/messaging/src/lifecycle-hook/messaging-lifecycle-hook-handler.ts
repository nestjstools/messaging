import { Injectable } from '@nestjs/common';
import { MessagingLifecycleHookRegistry } from './messaging-lifecycle-hook.registry';
import { LifecycleHook } from './messaging-lifecycle-hook-listener';
import { RoutingMessage } from '../message/routing-message';

@Injectable()
export class MessagingLifecycleHookHandler {
  constructor(
    private readonly messagingHookRegistry: MessagingLifecycleHookRegistry,
  ) {
  }

  async handleAfterMessageDenormalized(message: RoutingMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.AFTER_MESSAGE_DENORMALIZED)
      .forEach((listener) => listener.on(message));
  }

  async handleBeforeMessageHandler(message: RoutingMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.BEFORE_MESSAGE_HANDLER)
      .forEach((listener) => listener.on(message));
  }

  async handleAfterMessageHandlerExecuted(message: RoutingMessage): Promise<void> {
    await this.messagingHookRegistry
      .getAllByHook(LifecycleHook.AFTER_MESSAGE_HANDLER_EXECUTED)
      .forEach((listener) => listener.on(message));
  }
}
