import { type Mock, vi } from 'vitest';
import { ConsumerMessageBus } from '../../../src.js';
import { IMessageBus } from '../../../src.js';
import { TestChannel } from '../../support/test.channel.js';
import { InMemoryChannelConfig } from '../../../src.js';
import { SpyLogger } from '../../support/logger/spy.logger.js';
import { IMessagingConsumer } from '../../../src.js';
import { ExceptionListenerHandler } from '../../../src/exception-listener/exception-listener-handler.js';
import { ConsumerMessage } from '../../../src.js';
import { SealedRoutingMessage } from '../../../src/message/sealed-routing-message.js';
import { DefaultMessageOptions } from '../../../src.js';
import { ObjectForwardMessageNormalizer } from '../../../src/normalizer/object-forward-message.normalizer.js';
import { ConsumerDispatchedMessageError } from '../../../src.js';
import { HandlerError, HandlersException } from '../../../src.js';
import { ExceptionContext } from '../../../src.js';
import { MessagingLifecycleHookHandler } from '../../../src/lifecycle-hook/messaging-lifecycle-hook-handler.js';
import { Logger } from '@nestjs/common';
import { MessagingLifecycleHookRegistry } from '../../../src/lifecycle-hook/messaging-lifecycle-hook.registry.js';

describe('ConsumerMessageBus', () => {
  let messageBus: IMessageBus;
  let messageBusDispatchMock: Mock;
  let logger: SpyLogger;
  let consumer: IMessagingConsumer<any>;
  let consumerOnErrorMock: Mock;
  let exceptionListenerHandler: ExceptionListenerHandler;
  let exceptionHandlerMock: Mock;
  let messagingLifecycleHookHandler: MessagingLifecycleHookHandler;
  let channel: TestChannel;

  beforeEach(() => {
    vi.clearAllMocks();

    messageBusDispatchMock = vi.fn().mockResolvedValue(undefined);
    messageBus = {
      dispatch: messageBusDispatchMock,
    } as unknown as IMessageBus;
    logger = new SpyLogger(new Logger(), false, false);
    consumerOnErrorMock = vi.fn().mockResolvedValue(undefined);
    consumer = {
      consume: vi.fn(),
      onError: consumerOnErrorMock,
    } as unknown as IMessagingConsumer<any>;
    exceptionHandlerMock = vi.fn().mockResolvedValue(undefined);
    exceptionListenerHandler = {
      handleError: exceptionHandlerMock,
    } as unknown as ExceptionListenerHandler;

    const registry = new MessagingLifecycleHookRegistry();
    messagingLifecycleHookHandler = new MessagingLifecycleHookHandler(registry);
    channel = new TestChannel(new InMemoryChannelConfig({ name: 'ds' }));
  });

  it('should dispatch SealedRoutingMessage and log debug when message is handled', async () => {
    const subjectUnderTest = new ConsumerMessageBus(
      messageBus,
      channel,
      logger,
      consumer,
      exceptionListenerHandler,
      messagingLifecycleHookHandler,
    );

    await subjectUnderTest.dispatch(
      new ConsumerMessage({ status: 'ok' }, 'routing_key'),
    );

    expect(messageBus.dispatch).toHaveBeenCalledWith(
      new SealedRoutingMessage(
        { status: 'ok' },
        'routing_key',
      ).createWithOptions(
        new DefaultMessageOptions([], false, ObjectForwardMessageNormalizer),
      ),
    );
    expect(consumer.onError).not.toHaveBeenCalled();
    expect(exceptionListenerHandler.handleError).not.toHaveBeenCalled();
    expect(logger.getLogs()).toContainEqual({
      type: 'DEBUG',
      content: {
        content: '[ds] Message handled with routing key: [routing_key]',
        metadata: {
          message: '{"status":"ok"}',
        },
      },
    });
  });

  it('should call onError and exception listener when message bus dispatch throws regular error', async () => {
    const error = new Error('boom');
    messageBusDispatchMock = vi.fn().mockRejectedValue(error);
    messageBus = {
      dispatch: messageBusDispatchMock,
    } as unknown as IMessageBus;

    const subjectUnderTest = new ConsumerMessageBus(
      messageBus,
      channel,
      logger,
      consumer,
      exceptionListenerHandler,
      messagingLifecycleHookHandler,
    );

    const consumerMessage = new ConsumerMessage({ status: 'fail' }, 'rk.fail');
    await subjectUnderTest.dispatch(consumerMessage);

    expect(consumer.onError).toHaveBeenCalledTimes(1);
    const errorArg = (consumer.onError as Mock).mock.calls[0][0];
    const channelArg = (consumer.onError as Mock).mock.calls[0][1];
    expect(errorArg).toBeInstanceOf(ConsumerDispatchedMessageError);
    expect(errorArg).toEqual(
      new ConsumerDispatchedMessageError(consumerMessage, error),
    );
    expect(channelArg).toBe(channel);

    expect(exceptionListenerHandler.handleError).toHaveBeenCalledWith(
      new ExceptionContext(error, 'ds', { status: 'fail' }, 'rk.fail'),
    );

    expect(logger.getLogs()).toContainEqual({
      type: 'ERROR',
      content: {
        content: 'Some error occurred in channel [ds]',
        metadata: {
          error: 'boom',
          message: '{"status":"fail"}',
          routingKey: 'rk.fail',
        },
      },
    });
  });

  it('should not log error when dispatch throws HandlersException', async () => {
    const handlersError = new HandlersException([
      new HandlerError('MyHandler', new Error('handler failed')),
    ]);

    messageBusDispatchMock = vi.fn().mockRejectedValue(handlersError);
    messageBus = {
      dispatch: messageBusDispatchMock,
    } as unknown as IMessageBus;

    const subjectUnderTest = new ConsumerMessageBus(
      messageBus,
      channel,
      logger,
      consumer,
      exceptionListenerHandler,
      messagingLifecycleHookHandler,
    );

    await subjectUnderTest.dispatch(
      new ConsumerMessage({ status: 'fail' }, 'rk.handlers'),
    );

    expect(consumer.onError).toHaveBeenCalledTimes(1);
    expect(exceptionListenerHandler.handleError).toHaveBeenCalledWith(
      new ExceptionContext(
        handlersError,
        'ds',
        { status: 'fail' },
        'rk.handlers',
      ),
    );
    expect(logger.getLogs().find((log) => log.type === 'ERROR')).toBeFalsy();
  });
});
