import { ConsumerMessageBus } from '../../../src';
import { IMessageBus } from '../../../src';
import { TestChannel } from '../../support/test.channel';
import { InMemoryChannelConfig } from '../../../src';
import { SpyLogger } from '../../support/logger/spy.logger';
import { IMessagingConsumer } from '../../../src';
import { ExceptionListenerHandler } from '../../../src/exception-listener/exception-listener-handler';
import { ConsumerMessage } from '../../../src';
import { SealedRoutingMessage } from '../../../src/message/sealed-routing-message';
import { DefaultMessageOptions } from '../../../src';
import { ObjectForwardMessageNormalizer } from '../../../src/normalizer/object-forward-message.normalizer';
import { ConsumerDispatchedMessageError } from '../../../src';
import { HandlerError, HandlersException } from '../../../src';
import { ExceptionContext } from '../../../src';
import { MessagingLifecycleHookHandler } from '../../../src/lifecycle-hook/messaging-lifecycle-hook-handler';
import { Logger } from '@nestjs/common';

describe('ConsumerMessageBus', () => {
  let messageBus: IMessageBus;
  let messageBusDispatchMock: jest.Mock;
  let logger: SpyLogger;
  let consumer: IMessagingConsumer<any>;
  let consumerOnErrorMock: jest.Mock;
  let exceptionListenerHandler: ExceptionListenerHandler;
  let exceptionHandlerMock: jest.Mock;
  let messagingLifecycleHookHandler: MessagingLifecycleHookHandler;
  let failedConsumerHookMock: jest.Mock;
  let channel: TestChannel;

  beforeEach(() => {
    jest.clearAllMocks();

    messageBusDispatchMock = jest.fn().mockResolvedValue(undefined);
    messageBus = {
      dispatch: messageBusDispatchMock,
    } as unknown as IMessageBus;
    logger = new SpyLogger(new Logger(), false, false);
    consumerOnErrorMock = jest.fn().mockResolvedValue(undefined);
    consumer = {
      consume: jest.fn(),
      onError: consumerOnErrorMock,
    } as unknown as IMessagingConsumer<any>;
    exceptionHandlerMock = jest.fn().mockResolvedValue(undefined);
    exceptionListenerHandler = {
      handleError: exceptionHandlerMock,
    } as unknown as ExceptionListenerHandler;
    failedConsumerHookMock = jest.fn().mockResolvedValue(undefined);
    messagingLifecycleHookHandler = {
      handleAfterMessageDenormalized: jest.fn().mockResolvedValue(undefined),
      handleBeforeMessageHandler: jest.fn().mockResolvedValue(undefined),
      handleAfterMessageHandlerExecuted: jest.fn().mockResolvedValue(undefined),
      handleOnFailedMessageConsumer: failedConsumerHookMock,
      handleBeforeMessageNormalization: jest.fn().mockResolvedValue(undefined),
      handleAfterMessageNormalization: jest.fn().mockResolvedValue(undefined),
    } as unknown as MessagingLifecycleHookHandler;
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
    messageBusDispatchMock = jest.fn().mockRejectedValue(error);
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
    const errorArg = (consumer.onError as jest.Mock).mock.calls[0][0];
    const channelArg = (consumer.onError as jest.Mock).mock.calls[0][1];
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
    expect(failedConsumerHookMock).toHaveBeenCalledTimes(1);
  });

  it('should not log error when dispatch throws HandlersException', async () => {
    const handlersError = new HandlersException([
      new HandlerError('MyHandler', new Error('handler failed')),
    ]);

    messageBusDispatchMock = jest.fn().mockRejectedValue(handlersError);
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
    expect(failedConsumerHookMock).toHaveBeenCalledTimes(1);
  });
});
