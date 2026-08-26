import { HandlerMiddleware } from '../../../src/middleware/handler-middleware';
import { MessageHandlerRegistry } from '../../../src/handler/message-handler.registry';
import { SpyLogger } from '../../support/logger/spy.logger';
import {
  IMessageHandler,
  MiddlewareContext,
  RoutingMessage,
} from '../../../src';

describe('HandlerMiddleware', () => {
  let logger: SpyLogger;
  let registry: MessageHandlerRegistry;

  beforeEach(() => {
    logger = SpyLogger.create();
    registry = new MessageHandlerRegistry();
    registry.register(['abc'], {
      handle: jest.fn(() => null),
    } as IMessageHandler<any>);
  });

  test('should found a handler', () => {
    const subjectUnderTest = new HandlerMiddleware(registry, logger);

    subjectUnderTest.process(
      new RoutingMessage({ id: 1 }, 'abc'),
      MiddlewareContext.createFresh([]),
    );

    expect(logger.getLogs()).toEqual([
      {
        type: 'DEBUG',
        content: {
          content: 'Found a handler [Object] for message [abc]',
          metadata: {},
        },
      },
    ]);
  });

  test('should wrap rejected handler errors when multiple handlers are registered', async () => {
    const firstHandler = {
      handle: jest.fn(() => Promise.resolve()),
    } as IMessageHandler<any>;

    const secondHandler = {
      handle: jest.fn(() => Promise.reject(new Error('Expected error'))),
    } as IMessageHandler<any>;

    registry = new MessageHandlerRegistry();
    registry.register(['abc'], firstHandler);
    registry.register(['abc'], secondHandler);

    const subjectUnderTest = new HandlerMiddleware(registry, logger);

    await expect(
      subjectUnderTest.process(
        new RoutingMessage({ id: 1 }, 'abc'),
        MiddlewareContext.createFresh([]),
      ),
    ).rejects.toMatchObject({
      errors: [
        {
          handler: 'Object',
          errorMessage: 'Expected error',
        },
      ],
    });
  });

  test('should execute higher-priority handlers before lower-priority handlers', async () => {
    const executionOrder: string[] = [];
    const lowerPriorityHandler = {
      handle: jest.fn(async () => {
        executionOrder.push('lower');
      }),
    } as IMessageHandler<any>;
    const higherPriorityHandler = {
      handle: jest.fn(async () => {
        executionOrder.push('higher:start');
        await Promise.resolve();
        executionOrder.push('higher:end');
      }),
    } as IMessageHandler<any>;

    registry = new MessageHandlerRegistry();
    registry.register(['abc'], lowerPriorityHandler, { priority: 1 });
    registry.register(['abc'], higherPriorityHandler, { priority: 2 });

    const subjectUnderTest = new HandlerMiddleware(registry, logger);

    await subjectUnderTest.process(
      new RoutingMessage({ id: 1 }, 'abc'),
      MiddlewareContext.createFresh([]),
    );

    expect(executionOrder).toEqual(['higher:start', 'higher:end', 'lower']);
  });
});
