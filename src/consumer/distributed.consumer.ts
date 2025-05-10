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
import { DefaultMessageOptions } from '../message/default-message-options';
import { ConsumerDispatchedMessageError } from './consumer-dispatched-message-error';
import { SealedRoutingMessage } from '../message/sealed-routing-message';
import { Log } from '../logger/log';
import { HandlersException } from '../exception/handlers.exception';
import { ExceptionListenerHandler } from '../exception-listener/exception-listener-handler';
import { ExceptionContext } from '../exception-listener/exception-context';

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
    for (const channel of this.channelRegistry.getALl()) {
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

      const mediator = new ConsumerMessageMediator();
      const consumer: IMessagingConsumer<any> = channelConsumer[0].instance;

      await consumer.consume(mediator, channel);

      mediator.listen().subscribe(async (consumerMessage) => {
        try {
          this.logger.debug(Log.create(
              `[${channel.config.name}] Message handled with routing key: [${consumerMessage.routingKey}]`,
              {
                message: JSON.stringify(consumerMessage.message),
              },
            ),
          );

          const middlewares: Middleware[] = channel.config
            .middlewares as Middleware[];

          const routingMessage = new SealedRoutingMessage(
            consumerMessage.message,
            consumerMessage.routingKey,
          ).createWithOptions(new DefaultMessageOptions(
            middlewares,
            channel.config?.avoidErrorsForNotExistedHandlers ?? true,
            channel.config.normalizer,
          ));

          await this.messageBus.dispatch(routingMessage);
        } catch (e) {
          await consumer.onError(
            new ConsumerDispatchedMessageError(consumerMessage, e),
            channel,
          );

          if (!(e instanceof HandlersException)) {
            this.logger.error(Log.create(`Some error occurred in channel [${channel.config.name}]`, {
              error: e,
              message: JSON.stringify(consumerMessage.message),
              routingKey: consumerMessage.routingKey,
            }));
          }

          await this.exceptionListenerHandler.handleError(new ExceptionContext(e, channel.config.name, consumerMessage.message, consumerMessage.routingKey));
        }
      });

      this.logger.log(
        `Consumer for channel [${channel.config.name}] is ready to handle messages`,
      );
    }
  }
}
