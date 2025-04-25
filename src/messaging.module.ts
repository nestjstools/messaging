import {
  DynamicModule,
  Logger as NestCommonLogger,
  Module,
  OnApplicationBootstrap,
} from '@nestjs/common';
import {
  ChannelConfig,
  InMemoryChannelConfig,
  MessagingModuleOptions,
} from './config';
import { Service } from './dependency-injection/service';
import { CompositeChannelFactory } from './channel/factory/composite-channel.factory';
import { ChannelRegistry } from './channel/channel.registry';
import { CompositeMessageBusFactory } from './bus/composite-message-bus.factory';
import { MessagingLogger } from './logger/messaging-logger';
import { DistributedMessageBus } from './bus/distributed-message.bus';
import { DiscoveryModule, DiscoveryService, ModuleRef } from '@nestjs/core';
import { InMemoryMessageBus } from './bus/in-memory-message.bus';
import { MessageHandlerRegistry } from './handler/message-handler.registry';
import { Channel } from './channel/channel';
import { NestLogger } from './logger/nest-logger';
import { InMemoryChannelFactory } from './channel/factory/in-memory-channel.factory';
import { DistributedConsumer } from './consumer/distributed.consumer';
import {
  registerHandlers, registerMessageNormalizers,
  registerMiddlewares,
} from './dependency-injection/register';
import { MiddlewareRegistry } from './middleware/middleware.registry';
import { InMemoryMessageBusFactory } from './bus/in-memory-message-bus.factory';
import { InMemoryChannel } from './channel/in-memory.channel';
import { HandlerMiddleware } from './middleware/handler-middleware';
import { MessageBusCollection } from './bus/message-bus.collection';
import { NormalizerRegistry } from './normalizer/normalizer.registry';
import { ObjectForwardMessageNormalizer } from './normalizer/object-forward-message.normalizer';

@Module({})
export class MessagingModule implements OnApplicationBootstrap {
  static forRoot(options: MessagingModuleOptions): DynamicModule {
    const registerChannels = (): any => {
      return {
        provide: Service.CHANNELS,
        useFactory: (compositeChannelFactory: CompositeChannelFactory) => {
          return options.channels.map((channelConfig: ChannelConfig) =>
            compositeChannelFactory.create(channelConfig),
          );
        },
        inject: [CompositeChannelFactory],
      };
    };

    const defineBuses = (): any[] => {
      return options.buses.map((bus) => ({
        provide: `${bus.name}`,
        useFactory: (
          channelRegistry: ChannelRegistry,
          busFactory: CompositeMessageBusFactory,
          logger: MessagingLogger,
          normalizerRegistry: NormalizerRegistry,
        ) => {
          const messageBusCollection = new MessageBusCollection();

          for (const channelName of bus.channels) {
            const channel = channelRegistry.getByName(channelName);
            messageBusCollection.add({ messageBus: busFactory.create(channel), channel: channel });
          }

          const messageBus = new DistributedMessageBus(messageBusCollection, normalizerRegistry);

          logger.log(`MessageBus [${bus.name}] was created successfully`);

          return messageBus;
        },
        inject: [
          Service.CHANNEL_REGISTRY,
          CompositeMessageBusFactory,
          Service.LOGGER,
          Service.MESSAGE_NORMALIZERS_REGISTRY,
        ],
      }));
    };

    return {
      global: options.global ?? true,
      module: MessagingModule,
      imports: [DiscoveryModule],
      providers: [
        ...defineBuses(),
        registerChannels(),
        {
          provide: Service.DEFAULT_MESSAGE_BUS,
          useFactory: (
            messageHandlerRegistry: MessageHandlerRegistry,
            middlewareRegistry: MiddlewareRegistry,
            normalizerRegistry: NormalizerRegistry,
          ) => {
            return new InMemoryMessageBus(
              messageHandlerRegistry,
              middlewareRegistry,
              new InMemoryChannel(
                new InMemoryChannelConfig({
                  name: 'default.bus',
                  middlewares: [],
                  avoidErrorsForNotExistedHandlers: true,
                }),
              ),
              normalizerRegistry,
            );
          },
          inject: [
            Service.MESSAGE_HANDLERS_REGISTRY,
            Service.MIDDLEWARE_REGISTRY,
            Service.MESSAGE_NORMALIZERS_REGISTRY,
          ],
        },
        {
          provide: Service.MESSAGE_HANDLERS_REGISTRY,
          useClass: MessageHandlerRegistry,
        },
        {
          provide: Service.MESSAGE_NORMALIZERS_REGISTRY,
          useClass: NormalizerRegistry,
        },
        {
          provide: Service.MIDDLEWARE_REGISTRY,
          useClass: MiddlewareRegistry,
        },
        {
          provide: Service.CHANNEL_REGISTRY,
          useFactory: (channels: Channel<any>[], logger: MessagingLogger) => {
            return new ChannelRegistry(channels, logger);
          },
          inject: [Service.CHANNELS, Service.LOGGER],
        },
        {
          provide: Service.LOGGER,
          useValue: new NestLogger(
            new NestCommonLogger(),
            options.debug ?? false,
            options.logging ?? true,
          ),
        },
        HandlerMiddleware,
        CompositeChannelFactory,
        CompositeMessageBusFactory,
        InMemoryMessageBusFactory,
        InMemoryChannelFactory,
        DistributedConsumer,
        ObjectForwardMessageNormalizer,
      ],
      exports: [
        Service.DEFAULT_MESSAGE_BUS,
        ...defineBuses(),
        DistributedConsumer,
        ObjectForwardMessageNormalizer,
      ],
    };
  }

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
  ) {}

  onApplicationBootstrap(): any {
    registerHandlers(this.moduleRef, this.discoveryService);
    registerMiddlewares(this.moduleRef, this.discoveryService);
    registerMessageNormalizers(this.moduleRef, this.discoveryService);

    const consumer = this.moduleRef.get(DistributedConsumer);
    consumer.run();
  }
}
