import { Inject, Injectable } from '@nestjs/common';
import { IMessageBus } from './i-message-bus.js';
import { MessageHandlerRegistry } from '../handler/message-handler.registry.js';
import { Service } from '../dependency-injection/service.js';
import { MiddlewareRegistry } from '../middleware/middleware.registry.js';
import { InMemoryChannel } from '../channel/in-memory.channel.js';
import { MessageBusFactory } from '../dependency-injection/decorator.js';
import { InMemoryMessageBus } from './in-memory-message.bus.js';
import { IMessageBusFactory } from './i-message-bus.factory.js';
import { NormalizerRegistry } from '../normalizer/normalizer.registry.js';
import { MessagingLifecycleHookHandler } from '../lifecycle-hook/messaging-lifecycle-hook-handler.js';

@Injectable()
@MessageBusFactory(InMemoryChannel)
export class InMemoryMessageBusFactory implements IMessageBusFactory<InMemoryChannel> {
  constructor(
    @Inject(Service.MESSAGE_HANDLERS_REGISTRY)
    private registry: MessageHandlerRegistry,
    @Inject(Service.MIDDLEWARE_REGISTRY)
    private middlewareRegistry: MiddlewareRegistry,
    @Inject(Service.MESSAGE_NORMALIZERS_REGISTRY)
    private messageNormalizerRegistry: NormalizerRegistry,
    private messagingHookHandler: MessagingLifecycleHookHandler,
  ) {}

  create(channel: InMemoryChannel): IMessageBus {
    return new InMemoryMessageBus(
      this.registry,
      this.middlewareRegistry,
      channel,
      this.messageNormalizerRegistry,
      this.messagingHookHandler,
    );
  }
}
