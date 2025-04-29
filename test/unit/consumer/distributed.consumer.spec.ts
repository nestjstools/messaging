import { DistributedConsumer } from '../../../src/consumer/distributed.consumer';
import {
  ConsumerMessage,
  ConsumerMessageMediator, DefaultMessageOptions,
  IMessageBus,
  IMessagingConsumer,
  InMemoryChannelConfig,
} from '../../../src';
import { ChannelRegistry } from '../../../src/channel/channel.registry';
import { Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { TestChannel } from '../../support/test.channel';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { SpyLogger } from '../../support/logger/spy.logger';
import { of } from 'rxjs';
import { SealedRoutingMessage } from '../../../src/message/sealed-routing-message';
import { ObjectForwardMessageNormalizer } from '../../../src/normalizer/object-forward-message.normalizer';

describe('DistributedConsumer', () => {
  let subjectUnderTest: DistributedConsumer;
  let messageBus: IMessageBus;
  let logger: SpyLogger;
  let discoveryService: DiscoveryService;

  beforeEach(async () => {
    logger = new SpyLogger(new Logger(), false, false);

    Reflect.hasMetadata = jest.fn().mockReturnValue(true);
    Reflect.getMetadata = jest.fn().mockReturnValue(TestChannel);
  });

  it('should call messageBus.dispatch when a message is received', async () => {
    messageBus = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    } as unknown as IMessageBus;

    const channelRegistry = new ChannelRegistry(
      [new TestChannel(new InMemoryChannelConfig({ name: 'ds' }))],
      logger
    );

    const consumer = {
      consume: jest.fn().mockImplementation(async (mediator: ConsumerMessageMediator, channel) => {
        jest.spyOn(mediator, 'listen').mockReturnValue(of(new ConsumerMessage({ status: 'ok' }, 'routing_key')));
      }),
      onError: jest.fn(),
    } as unknown as IMessagingConsumer<any>;

    const instanceWrapper = { instance: consumer, metatype: 'MESSAGE_CONSUMER_METADATA' } as unknown as InstanceWrapper;

    discoveryService = {
      getProviders: jest.fn().mockReturnValue([instanceWrapper]),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(messageBus, channelRegistry, logger, discoveryService);

    await subjectUnderTest.run();

    expect(messageBus.dispatch).toHaveBeenCalledWith(
      new SealedRoutingMessage(
        { status: 'ok' },
        'routing_key'
      ).createWithOptions(new DefaultMessageOptions([], false, ObjectForwardMessageNormalizer))
    );

    expect(logger.getLogs()).toEqual([
      { type: 'LOG', content: 'Channel [ds] was registered' },
      {
        type: 'DEBUG',
        content: {
          content: '[ds] Message handled with routing key: [routing_key]',
          metadata: {
            message: "{\"status\":\"ok\"}"
          },
        }
      },
      {
        type: 'LOG',
        content: 'Consumer for channel [ds] is ready to handle messages'
      }
    ]);
  });

  it('will provide avoidErrorsWhenNotExistedHandler as true to avoid errors', async () => {
    messageBus = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    } as unknown as IMessageBus;

    const consumer = {
      consume: jest.fn().mockImplementation(async (mediator: ConsumerMessageMediator, channel) => {
        jest.spyOn(mediator, 'listen').mockReturnValue(of(new ConsumerMessage({ status: 'ok' }, 'routing_key')));
      }),
      onError: jest.fn(),
    } as unknown as IMessagingConsumer<any>;

    const channelRegistry = new ChannelRegistry(
      [new TestChannel(new InMemoryChannelConfig({ name: 'ds',avoidErrorsForNotExistedHandlers: true }))],
      logger
    );

    const instanceWrapper = { instance: consumer, metatype: 'MESSAGE_CONSUMER_METADATA' } as unknown as InstanceWrapper;

    discoveryService = {
      getProviders: jest.fn().mockReturnValue([instanceWrapper]),
    } as unknown as DiscoveryService;

    subjectUnderTest = new DistributedConsumer(messageBus, channelRegistry, logger, discoveryService);

    await subjectUnderTest.run();

    expect(messageBus.dispatch).toHaveBeenCalledWith(
      new SealedRoutingMessage(
        { status: 'ok' },
        'routing_key'
      ).createWithOptions(new DefaultMessageOptions([], true, ObjectForwardMessageNormalizer))
    );
  });
});
