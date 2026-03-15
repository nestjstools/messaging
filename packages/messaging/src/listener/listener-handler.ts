import { Injectable } from '@nestjs/common';
import { ListenerRegistry } from './listener.registry';
import { MessagingListenerHook } from './messaging-listener';
import { Message } from '../message/message';

@Injectable()
export class ListenerHandler {
  constructor(
    private readonly listenerRegistry: ListenerRegistry,
  ) {
  }

  async handlePreMessageDispatched(message: Message): Promise<void> {
    await this.listenerRegistry
      .getAllByHook(MessagingListenerHook.PRE_MESSAGE_DISPATCHED)
      .forEach((listener) => listener.on(message));
  }

  async handlePostMessageDispatched(message: Message): Promise<void> {
    await this.listenerRegistry
      .getAllByHook(MessagingListenerHook.POST_MESSAGE_DISPATCHED)
      .forEach((listener) => listener.on(message));
  }
}
