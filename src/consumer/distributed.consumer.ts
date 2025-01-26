import { Inject } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Service } from '../dependency-injection/service';
import { IMessageBus } from '../bus/i-message-bus';
import { ChannelRegistry } from '../channel/channel.registry';
import { MessagingLogger } from '../logger/messaging-logger';
import { InMemoryChannel } from '../channel/in-memory.channel';
import { MESSAGE_CONSUMER_METADATA } from '../dependency-injection/decorator';
import { ConsumerMessageMediator } from './consumer-message-mediator';
import { IMessagingConsumer } from './i-messaging-consumer';
import { Middleware } from '../middleware/middleware';
import { RoutingMessage } from '../message/routing-message';
import { DefaultMessageOptions } from '../message/default-message-options';
import { ConsumerDispatchedMessageError } from './consumer-dispatched-message-error';

export class DistributedConsumer {
  constructor(
    @Inject(Service.DEFAULT_MESSAGE_BUS)
    private readonly messageBus: IMessageBus,
    @Inject(Service.CHANNEL_REGISTRY)
    private readonly channelRegistry: ChannelRegistry,
    @Inject(Service.LOGGER) private readonly logger: MessagingLogger,
    private readonly discoveryService: DiscoveryService,
  ) {}

  async run(): Promise<void> {
    for (const channel of this.channelRegistry.getALl()) {
      if (
        channel instanceof InMemoryChannel ||
        false === channel.config.enableConsumer
      ) {
        continue;
      }

      const chanelConsumer = this.discoveryService
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
          (factory) =>
            Reflect.getMetadata(MESSAGE_CONSUMER_METADATA, factory.metatype)
              .name === channel.constructor.name,
        );

      if (chanelConsumer.length !== 1) {
        throw new Error(
          `Consumer for channel ${channel.constructor.name} does not found`,
        );
      }

      const mediator = new ConsumerMessageMediator();
      const consumer: IMessagingConsumer = chanelConsumer[0].instance;

      await consumer.consume(mediator, channel);

      mediator.listen().subscribe(async (consumerMessage) => {
        try {
          this.logger.debug(
            `Message handled [${JSON.stringify(consumerMessage.message)}] with routing key: [${consumerMessage.routingKey}]`,
          );
          const middlewares: Middleware[] = channel.config
            .middlewares as Middleware[];
          await this.messageBus.dispatch(
            new RoutingMessage(
              consumerMessage.message,
              consumerMessage.routingKey,
            ).createWithOptions(new DefaultMessageOptions(middlewares)),
          );
        } catch (e) {
          await consumer.onError(
            new ConsumerDispatchedMessageError(consumerMessage, e),
            channel,
          );
          this.logger.error(`Some error occurred in handler: [${e}]`);
        }
      });

      this.logger.log(
        `Consumer for channel [${channel.config.name}] is ready to handle messages`,
      );
    }
  }
}
