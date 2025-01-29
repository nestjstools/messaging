import { Inject, Injectable } from '@nestjs/common';
import { IMessageBus } from './i-message-bus';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { Service } from '../dependency-injection/service';
import { MiddlewareRegistry } from '../middleware/middleware.registry';
import { InMemoryChannel } from '../channel/in-memory.channel';
import { MessageBusFactory } from '../dependency-injection/decorator';
import { InMemoryMessageBus } from './in-memory-message.bus';
import { IMessageBusFactory } from './i-message-bus.factory';
import { Channel } from '../channel/channel';
import { InvalidChannelException } from '../exception/invalid-channel.exception';

@Injectable()
@MessageBusFactory(InMemoryChannel)
export class InMemoryMessageBusFactory implements IMessageBusFactory {
  constructor(
    @Inject(Service.MESSAGE_HANDLERS_REGISTRY)
    private registry: MessageHandlerRegistry,
    @Inject(Service.MIDDLEWARE_REGISTRY)
    private middlewareRegistry: MiddlewareRegistry,
  ) {}

  create(channel: Channel): IMessageBus {
    if (!(channel instanceof InMemoryChannel)) {
      throw new InvalidChannelException(InMemoryChannel.name);
    }

    return new InMemoryMessageBus(
      this.registry,
      this.middlewareRegistry,
      channel,
    );
  }
}
