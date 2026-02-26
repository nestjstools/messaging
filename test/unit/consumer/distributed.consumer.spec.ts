import { Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { InMemoryChannel } from '../../../src/channel/in-memory.channel';
import { ChannelRegistry } from '../../../src/channel/channel.registry';
import { DistributedConsumer } from '../../../src/consumer/distributed.consumer';
import { IMessagingConsumer } from '../../../src';
import { InMemoryChannelConfig } from '../../../src';
import { SpyLogger } from '../../support/logger/spy.logger';
import { TestChannel } from '../../support/test.channel';
import { IMessageBus } from '../../../src';
import { ExceptionListenerHandler } from '../../../src/exception-listener/exception-listener-handler';
import { ConsumerMessageBus } from '../../../src';

describe('DistributedConsumer', () => {
  let subjectUnderTest: DistributedConsumer;
  let messageBus: IMessageBus;
  let logger: SpyLogger;
  let exceptionListenerHandler: ExceptionListenerHandler;
  let discoveryService: DiscoveryService;
  let consumeMock: jest.Mock;
  let onErrorMock: jest.Mock;

  beforeEach(() => {
    logger = new SpyLogger(new Logger(), false, false);
    exceptionListenerHandler = {
      handleError: jest.fn(),
    } as unknown as ExceptionListenerHandler;
    messageBus = {
      dispatch: jest.fn(),
    } as unknown as IMessageBus;

    consumeMock = jest.fn().mockResolvedValue(undefined);
    onErrorMock = jest.fn().mockResolvedValue(undefined);

    Reflect.hasMetadata = jest.fn().mockReturnValue(true);
    Reflect.getMetadata = jest.fn().mockReturnValue(TestChannel);
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
      getProviders: jest.fn().mockReturnValue([instanceWrapper]),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(
      messageBus,
      channelRegistry,
      exceptionListenerHandler,
      logger,
      discoveryService,
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
      getProviders: jest.fn(),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(
      messageBus,
      channelRegistry,
      exceptionListenerHandler,
      logger,
      discoveryService,
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
      getProviders: jest.fn(),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(
      messageBus,
      channelRegistry,
      exceptionListenerHandler,
      logger,
      discoveryService,
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
      getProviders: jest.fn().mockReturnValue([]),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(
      messageBus,
      channelRegistry,
      exceptionListenerHandler,
      logger,
      discoveryService,
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
      getProviders: jest.fn().mockReturnValue(providers),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(
      messageBus,
      channelRegistry,
      exceptionListenerHandler,
      logger,
      discoveryService,
    );

    await expect(subjectUnderTest.run()).rejects.toThrow(
      'Consumer for channel TestChannel does not found',
    );
  });
});
