import { type Mock, vi } from 'vitest';
import { Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { InMemoryChannel } from '../../../src/channel/in-memory.channel.js';
import { ChannelRegistry } from '../../../src/channel/channel.registry.js';
import { DistributedConsumer } from '../../../src/consumer/distributed.consumer.js';
import { IMessagingConsumer } from '../../../src.js';
import { InMemoryChannelConfig } from '../../../src.js';
import { SpyLogger } from '../../support/logger/spy.logger.js';
import { TestChannel } from '../../support/test.channel.js';
import { IMessageBus } from '../../../src.js';
import { ExceptionListenerHandler } from '../../../src/exception-listener/exception-listener-handler.js';
import { ConsumerMessageBus } from '../../../src.js';
import { MessagingLifecycleHookHandler } from '../../../src/lifecycle-hook/messaging-lifecycle-hook-handler.js';

describe('DistributedConsumer', () => {
  let subjectUnderTest: DistributedConsumer;
  let messageBus: IMessageBus;
  let logger: SpyLogger;
  let exceptionListenerHandler: ExceptionListenerHandler;
  let discoveryService: DiscoveryService;
  let consumeMock: Mock;
  let onErrorMock: Mock;
  let messagingLifecycleHookHandler: MessagingLifecycleHookHandler;

  beforeEach(() => {
    logger = new SpyLogger(new Logger(), false, false);
    exceptionListenerHandler = {
      handleError: vi.fn(),
    } as unknown as ExceptionListenerHandler;
    messageBus = {
      dispatch: vi.fn(),
    } as unknown as IMessageBus;

    messagingLifecycleHookHandler = {
      handleAfterMessageDenormalized: vi.fn().mockResolvedValue(undefined),
      handleBeforeMessageHandler: vi.fn().mockResolvedValue(undefined),
      handleAfterMessageHandlerExecuted: vi.fn().mockResolvedValue(undefined),
      handleOnFailedMessageConsumer: vi.fn().mockResolvedValue(undefined),
      handleBeforeMessageNormalization: vi.fn().mockResolvedValue(undefined),
      handleAfterMessageNormalization: vi.fn().mockResolvedValue(undefined),
    } as unknown as MessagingLifecycleHookHandler;

    consumeMock = vi.fn().mockResolvedValue(undefined);
    onErrorMock = vi.fn().mockResolvedValue(undefined);

    Reflect.hasMetadata = vi.fn().mockReturnValue(true);
    Reflect.getMetadata = vi.fn().mockReturnValue(TestChannel);
  });

  it('should create ConsumerMessageBus and call consume for matching channel consumer', async () => {
    const channel = new TestChannel(new InMemoryChannelConfig({ name: 'ds' }));
    const channelRegistry = new ChannelRegistry([channel], logger);

    const consumer = {
      consume: consumeMock,
      onError: onErrorMock,
    } as unknown as IMessagingConsumer<any>;

    const instanceWrapper = {
      instance: consumer,
      metatype: 'MESSAGE_CONSUMER_METADATA',
    } as unknown as InstanceWrapper;

    discoveryService = {
      getProviders: vi.fn().mockReturnValue([instanceWrapper]),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(
      messageBus,
      channelRegistry,
      exceptionListenerHandler,
      logger,
      discoveryService,
      messagingLifecycleHookHandler,
    );

    await subjectUnderTest.run();

    expect(consumeMock).toHaveBeenCalledTimes(1);
    expect(consumeMock).toHaveBeenCalledWith(
      expect.any(ConsumerMessageBus),
      channel,
    );
    expect(logger.getLogs()).toContainEqual({
      type: 'LOG',
      content: 'Consumer for channel [ds] is ready to handle messages',
    });
  });

  it('should skip consuming for InMemoryChannel', async () => {
    const channelRegistry = new ChannelRegistry(
      [new InMemoryChannel(new InMemoryChannelConfig({ name: 'in-memory' }))],
      logger,
    );

    discoveryService = {
      getProviders: vi.fn(),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(
      messageBus,
      channelRegistry,
      exceptionListenerHandler,
      logger,
      discoveryService,
      messagingLifecycleHookHandler,
    );

    await subjectUnderTest.run();

    expect(discoveryService.getProviders).not.toHaveBeenCalled();
  });

  it('should skip consuming when enableConsumer is false', async () => {
    const channelRegistry = new ChannelRegistry(
      [
        new TestChannel(
          new InMemoryChannelConfig({
            name: 'disabled-consumer',
            enableConsumer: false,
          }),
        ),
      ],
      logger,
    );

    discoveryService = {
      getProviders: vi.fn(),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(
      messageBus,
      channelRegistry,
      exceptionListenerHandler,
      logger,
      discoveryService,
      messagingLifecycleHookHandler,
    );

    await subjectUnderTest.run();

    expect(discoveryService.getProviders).not.toHaveBeenCalled();
  });

  it('should throw when no consumer is found for channel', async () => {
    const channelRegistry = new ChannelRegistry(
      [new TestChannel(new InMemoryChannelConfig({ name: 'ds' }))],
      logger,
    );

    discoveryService = {
      getProviders: vi.fn().mockReturnValue([]),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(
      messageBus,
      channelRegistry,
      exceptionListenerHandler,
      logger,
      discoveryService,
      messagingLifecycleHookHandler,
    );

    await expect(subjectUnderTest.run()).rejects.toThrow(
      'Consumer for channel TestChannel does not found',
    );
  });

  it('should throw when multiple consumers are found for channel', async () => {
    const channelRegistry = new ChannelRegistry(
      [new TestChannel(new InMemoryChannelConfig({ name: 'ds' }))],
      logger,
    );

    const consumer = {
      consume: consumeMock,
      onError: onErrorMock,
    } as unknown as IMessagingConsumer<any>;

    const providers = [
      {
        instance: consumer,
        metatype: 'MESSAGE_CONSUMER_METADATA_1',
      },
      {
        instance: consumer,
        metatype: 'MESSAGE_CONSUMER_METADATA_2',
      },
    ] as unknown as InstanceWrapper[];

    discoveryService = {
      getProviders: vi.fn().mockReturnValue(providers),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(
      messageBus,
      channelRegistry,
      exceptionListenerHandler,
      logger,
      discoveryService,
      messagingLifecycleHookHandler,
    );

    await expect(subjectUnderTest.run()).rejects.toThrow(
      'Consumer for channel TestChannel does not found',
    );
  });
});
