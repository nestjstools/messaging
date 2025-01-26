import {
  DynamicModule,
  Logger as NestCommonLogger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { ChannelConfig, MessagingModuleOptions } from './config';
import { Service } from './dependency-injection/service';
import { CompositeChannelFactory } from './channel/factory/composite-channel.factory';
import { ChannelRegistry } from './channel/channel.registry';
import { CompositeMessageBusFactory } from './bus/composite-message-bus.factory';
import { MessagingLogger } from './logger/messaging-logger';
import { IMessageBus } from './bus/i-message-bus';
import { DistributedMessageBus } from './bus/distributed-message.bus';
import { ClassNameProvider } from './shared/class-name.provider';
import { DiscoveryModule, ModuleRef } from '@nestjs/core';
import { InMemoryMessageBus } from './bus/in-memory-message.bus';
import { MessageHandlerRegistry } from './handler/message-handler.registry';
import { Channel } from './channel/channel';
import { NestLogger } from './logger/nest-logger';
import { InMemoryChannelFactory } from './channel/factory/in-memory-channel.factory';
import { DistributedConsumer } from './consumer/distributed.consumer';
import { registerHandlers } from './dependency-injection/register';

@Module({})
export class MessagingModule implements OnModuleInit {
  static forRoot(options: MessagingModuleOptions): DynamicModule {
    const defineHandlers = (): any[] => {
      return options.messageHandlers.map((handler) => ({
        provide: handler,
        useClass: handler,
      }));
    };

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
        ) => {
          const messageBusCollection: IMessageBus[] = [];

          for (const channelName of bus.channels) {
            const channel = channelRegistry.getByName(channelName);
            messageBusCollection.push(busFactory.create(channel));
          }

          const messageBus = new DistributedMessageBus(messageBusCollection);

          logger.log(`MessageBus [${bus.name}] was created successfully`);

          return messageBus;
        },
        inject: [
          Service.CHANNEL_REGISTRY,
          CompositeMessageBusFactory,
          Service.LOGGER,
        ],
      }));
    };

    const defineMiddlewares = (): any[] => {
      return options.channels.flatMap((channel) =>
        channel.middlewares.map((middleware) => ({
          provide: ClassNameProvider.getClassName(middleware),
          useClass: middleware,
        })),
      );
    };

    return {
      module: MessagingModule,
      imports: [DiscoveryModule],
      providers: [
        ...defineMiddlewares(),
        ...defineHandlers(),
        ...defineBuses(),
        registerChannels(),
        {
          provide: Service.MESSAGE_HANDLERS,
          useValue: options.messageHandlers,
        },
        {
          provide: Service.DEFAULT_MESSAGE_BUS,
          useClass: InMemoryMessageBus,
        },
        {
          provide: Service.MESSAGE_HANDLERS_REGISTRY,
          useClass: MessageHandlerRegistry,
        },
        {
          provide: Service.CHANNEL_REGISTRY,
          useFactory: (channels: Channel[], logger: MessagingLogger) => {
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
        CompositeChannelFactory,
        CompositeMessageBusFactory,
        InMemoryChannelFactory,
        DistributedConsumer,
      ],
      exports: [Service.DEFAULT_MESSAGE_BUS, ...defineBuses()],
    };
  }

  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit(): any {
    registerHandlers(this.moduleRef);

    const consumer = this.moduleRef.get(DistributedConsumer);
    consumer.run();
  }
}
