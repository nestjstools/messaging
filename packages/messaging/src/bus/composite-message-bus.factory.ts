import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { DefaultMessageBus } from '../dependency-injection/injectable.js';
import { IMessageBus } from './i-message-bus.js';
import { Channel } from '../channel/channel.js';
import { InMemoryChannel } from '../channel/in-memory.channel.js';
import { MESSAGE_BUS_FACTORY_METADATA } from '../dependency-injection/decorator.js';
import { MessagingException } from '../exception/messaging.exception.js';

@Injectable()
export class CompositeMessageBusFactory {
  constructor(
    @DefaultMessageBus() private readonly defaultMessageBus: IMessageBus,
    private readonly discoveryService: DiscoveryService,
  ) {}

  create(channel: Channel<any>): IMessageBus {
    if (
      channel instanceof InMemoryChannel &&
      'default.bus' === channel.config.name
    ) {
      return this.defaultMessageBus;
    }

    const factory = this.discoveryService
      .getProviders()
      .filter((provider) => {
        if (!provider.metatype) {
          return false;
        }

        return Reflect.hasMetadata(
          MESSAGE_BUS_FACTORY_METADATA,
          provider.metatype,
        );
      })
      .filter(
        (factory) =>
          Reflect.getMetadata(MESSAGE_BUS_FACTORY_METADATA, factory.metatype)
            .name === channel.constructor.name,
      );

    if (factory.length !== 1) {
      throw new MessagingException(
        `Unsupported message bus factory for channel ${channel.constructor.name}`,
      );
    }

    return factory[0].instance.create(channel);
  }
}
