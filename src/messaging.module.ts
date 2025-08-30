import {
  DynamicModule,
  FactoryProvider,
  Logger as NestCommonLogger,
  Module,
  OnApplicationBootstrap, OnApplicationShutdown, OnModuleDestroy,
  Provider,
} from '@nestjs/common';
import {
  ChannelConfig,
  DefineChannels,
  InMemoryChannelConfig,
  MessagingModuleAsyncOptions,
  MessagingModuleOptions,
  MandatoryMessagingModuleOptions,
} from './config';
import { Service } from './dependency-injection/service';
import { CompositeChannelFactory } from './channel/factory/composite-channel.factory';
import { ChannelRegistry } from './channel/channel.registry';
import { CompositeMessageBusFactory } from './bus/composite-message-bus.factory';
import { IMessagingLogger } from './logger/i-messaging-logger';
import { DistributedMessageBus } from './bus/distributed-message.bus';
import { DiscoveryModule, DiscoveryService, ModuleRef } from '@nestjs/core';
import { InMemoryMessageBus } from './bus/in-memory-message.bus';
import { MessageHandlerRegistry } from './handler/message-handler.registry';
import { Channel } from './channel/channel';
import { NestLogger } from './logger/nest-logger';
import { InMemoryChannelFactory } from './channel/factory/in-memory-channel.factory';
import { DistributedConsumer } from './consumer/distributed.consumer';
import {
  registerExceptionListener,
  registerHandlers,
  registerMessageNormalizers,
  registerMiddlewares,
} from './dependency-injection/register';
import { MiddlewareRegistry } from './middleware/middleware.registry';
import { InMemoryMessageBusFactory } from './bus/in-memory-message-bus.factory';
import { InMemoryChannel } from './channel/in-memory.channel';
import { HandlerMiddleware } from './middleware/handler-middleware';
import { MessageBusCollection } from './bus/message-bus.collection';
import { NormalizerRegistry } from './normalizer/normalizer.registry';
import { ObjectForwardMessageNormalizer } from './normalizer/object-forward-message.normalizer';
import { ExceptionListenerRegistry } from './exception-listener/exception-listener.registry';
import { ExceptionListenerHandler } from './exception-listener/exception-listener-handler';

@Module({})
export class MessagingModule implements OnApplicationBootstrap, OnModuleDestroy {
  static forRoot(options: MessagingModuleOptions): DynamicModule {
    const channels = options.channels ?? [];

    const registerChannels: FactoryProvider = {
      provide: Service.CHANNELS,
      useFactory: (compositeChannelFactory: CompositeChannelFactory) => {
        return channels.map((channelConfig: ChannelConfig) =>
          compositeChannelFactory.create(channelConfig),
        );
      },
      inject: [CompositeChannelFactory],
    };

    return MessagingModule.createDynamicModule(options, [registerChannels]);
  }

  static forRootAsync(options: MessagingModuleAsyncOptions): DynamicModule {
    const registerAsyncConfig: FactoryProvider = {
      provide: Service.MESSAGING_MODULE_ASYNC_CHANNEL_OPTIONS,
      useFactory: options.useChannelFactory,
      inject: options.inject ?? [],
    };

    const registerChannels: FactoryProvider = {
      provide: Service.CHANNELS,
      useFactory: (
        compositeChannelFactory: CompositeChannelFactory,
        channels: DefineChannels,
      ) => {
        return (channels ?? []).map((channelConfig: ChannelConfig) =>
          compositeChannelFactory.create(channelConfig),
        );
      },
      inject: [
        CompositeChannelFactory,
        Service.MESSAGING_MODULE_ASYNC_CHANNEL_OPTIONS,
      ],
    };

    return MessagingModule.createDynamicModule(
      options,
      [registerAsyncConfig, registerChannels],
      options.imports ?? [],
    );
  }

  private static createDynamicModule(
    options: MandatoryMessagingModuleOptions,
    providers: Provider[] = [],
    imports: any = [],
  ): DynamicModule {
    const buses = options.buses ?? [];

    const registerBuses = (): FactoryProvider[] => {
      return buses.map((bus) => ({
        provide: `${bus.name}`,
        useFactory: (
          channelRegistry: ChannelRegistry,
          busFactory: CompositeMessageBusFactory,
          logger: IMessagingLogger,
          normalizerRegistry: NormalizerRegistry,
        ) => {
          const messageBusCollection = new MessageBusCollection();

          for (const channelName of bus.channels) {
            const channel = channelRegistry.getByName(channelName);
            messageBusCollection.add({
              messageBus: busFactory.create(channel),
              channel: channel,
            });
          }

          const messageBus = new DistributedMessageBus(
            messageBusCollection,
            normalizerRegistry,
          );

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

    const defaultMessageBus = (): Provider => {
      return {
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
      };
    };

    const loggerProvider = (options.customLogger && typeof options.customLogger === 'function'
      ? { provide: Service.LOGGER, useClass: options.customLogger }
      : {
        provide: Service.LOGGER,
        useValue:
          options.customLogger ??
          new NestLogger(
            new NestCommonLogger(),
            options.debug ?? false,
            options.logging ?? true,
          ),
      }) as Provider;

    return {
      global: options.global ?? true,
      module: MessagingModule,
      imports: [DiscoveryModule, ...imports],
      providers: [
        ...providers,
        defaultMessageBus(),
        ...registerBuses(),
        {
          provide: Service.MESSAGE_HANDLERS_REGISTRY,
          useClass: MessageHandlerRegistry,
        },
        {
          provide: Service.EXCEPTION_LISTENER_REGISTRY,
          useClass: ExceptionListenerRegistry,
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
          provide: Service.EXCEPTION_LISTENER_HANDLER,
          useClass: ExceptionListenerHandler,
        },
        {
          provide: Service.CHANNEL_REGISTRY,
          useFactory: (channels: Channel<any>[], logger: IMessagingLogger) => {
            return new ChannelRegistry(channels, logger);
          },
          inject: [Service.CHANNELS, Service.LOGGER],
        },
        loggerProvider,
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
        ...registerBuses().map((bus) => bus.provide),
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
    registerExceptionListener(this.moduleRef, this.discoveryService);

    const consumer = this.moduleRef.get(DistributedConsumer);
    consumer.run();
  }

  async onModuleDestroy(): Promise<any> {
    const channels: Channel<ChannelConfig>[] = this.moduleRef.get(Service.CHANNELS);

    for (const channel of channels) {
      await channel.onChannelDestroy();
    }
  }
}
