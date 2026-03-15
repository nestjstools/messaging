import { Inject } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Service } from '../dependency-injection/service';
import { IMessageBus } from '../bus/i-message-bus';
import { ChannelRegistry } from '../channel/channel.registry';
import { MessagingLogger } from '../logger/messaging-logger';
import { InMemoryChannel } from '../channel/in-memory.channel';
import { MESSAGE_CONSUMER_METADATA } from '../dependency-injection/decorator';
import { IMessagingConsumer } from './i-messaging-consumer';
import { ExceptionListenerHandler } from '../exception-listener/exception-listener-handler';
import { ConsumerMessageBus } from '../bus/consumer.message-bus';

export class DistributedConsumer {
  constructor(
    @Inject(Service.DEFAULT_MESSAGE_BUS)
    private readonly messageBus: IMessageBus,
    @Inject(Service.CHANNEL_REGISTRY)
    private readonly channelRegistry: ChannelRegistry,
    @Inject(Service.EXCEPTION_LISTENER_HANDLER)
    private readonly exceptionListenerHandler: ExceptionListenerHandler,
    @Inject(Service.LOGGER) private readonly logger: MessagingLogger,
    private readonly discoveryService: DiscoveryService,
  ) {
  }

  async run(): Promise<void> {
    for (const channel of this.channelRegistry.getAll()) {
      if (
        channel instanceof InMemoryChannel ||
        false === channel.config.enableConsumer
      ) {
        continue;
      }

      const channelConsumer = this.discoveryService
        .getProviders()
        .filter((provider) => {
          if (!provider.metatype) {
            return false;
          }

          return Reflect.hasMetadata(
            MESSAGE_CONSUMER_METADATA,
            provider.metatype,
          );
        })
        .filter(
          (consumer) =>
            Reflect.getMetadata(MESSAGE_CONSUMER_METADATA, consumer.metatype)
              .name === channel.constructor.name,
        );

      if (channelConsumer.length !== 1) {
        throw new Error(
          `Consumer for channel ${channel.constructor.name} does not found`,
        );
      }

      const consumer: IMessagingConsumer<any> = channelConsumer[0].instance;

      const dispatcher = new ConsumerMessageBus(
        this.messageBus,
        channel,
        this.logger,
        consumer,
        this.exceptionListenerHandler,
      );

      await consumer.consume(dispatcher, channel);

      this.logger.log(
        `Consumer for channel [${channel.config.name}] is ready to handle messages`,
      );
    }
  }
}
