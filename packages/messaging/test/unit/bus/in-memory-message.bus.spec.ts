import { vi } from 'vitest';
import {
  IMessageHandler,
  InMemoryMessageBus,
  Middleware,
  RoutingMessage,
} from '../../../src.js';
import { MessageHandlerRegistry } from '../../../src/handler/message-handler.registry.js';
import { MiddlewareRegistry } from '../../../src/middleware/middleware.registry.js';
import { InMemoryChannel } from '../../../src/channel/in-memory.channel.js';
import { NormalizerRegistry } from '../../../src/normalizer/normalizer.registry.js';
import { MessagingLifecycleHookHandler } from '../../../src/lifecycle-hook/messaging-lifecycle-hook-handler.js';

describe('InMemoryMessageBus', () => {
  let handlerRegistry: MessageHandlerRegistry;
  let middlewareRegistry: MiddlewareRegistry;
  let normalizerRegistry: NormalizerRegistry;
  let messagingHookHandler: MessagingLifecycleHookHandler;
  let defaultMiddleware: Middleware;

  beforeEach(async () => {
    handlerRegistry = new MessageHandlerRegistry();
    middlewareRegistry = new MiddlewareRegistry();
    normalizerRegistry = new NormalizerRegistry();
    messagingHookHandler = {
      handleAfterConsumerDispatchMessage: vi.fn(),
      handleAfterMessageDenormalized: vi.fn(),
      handleBeforeMessageHandler: vi.fn(),
      handleAfterMessageHandlerExecuted: vi.fn(),
    } as unknown as MessagingLifecycleHookHandler;

    defaultMiddleware = {
      process: vi.fn().mockImplementation(() => {
        return { response: 'response from mocked handler' };
      }),
    } as unknown as Middleware;

    middlewareRegistry.register('HandlerMiddleware', defaultMiddleware);
  });

  it('should not throw error if no handler is mapped for routingKey as default', async () => {
    const subjectUnderTest = new InMemoryMessageBus(
      handlerRegistry,
      middlewareRegistry,
      new InMemoryChannel({
        name: 'example.bus',
      }),
      normalizerRegistry,
      messagingHookHandler,
    );

    await subjectUnderTest.dispatch(
      new RoutingMessage({ title: 'hello' }, 'my_routing.key'),
    );
  });

  it('should not throw error if no handler is mapped for routingKey for default.bus', async () => {
    const subjectUnderTest = new InMemoryMessageBus(
      handlerRegistry,
      middlewareRegistry,
      new InMemoryChannel({
        name: 'default.bus',
      }),
      normalizerRegistry,
      messagingHookHandler,
    );

    await subjectUnderTest.dispatch(
      new RoutingMessage({ title: 'hello' }, 'my_routing.key'),
    );
  });

  it('should throw error if no handler is mapped for routingKey when in config is set to false', async () => {
    const subjectUnderTest = new InMemoryMessageBus(
      handlerRegistry,
      middlewareRegistry,
      new InMemoryChannel({
        name: 'example.bus',
        avoidErrorsForNotExistedHandlers: false,
      }),
      normalizerRegistry,
      messagingHookHandler,
    );

    await expect(
      subjectUnderTest.dispatch(
        new RoutingMessage({ title: 'hello' }, 'my_routing.key'),
      ),
    ).rejects.toThrowError(
      'There is no handlers for this routing key: [my_routing.key]',
    );
  });

  it('should run middlewares at the end', async () => {
    const handler = {
      handle: vi.fn(),
    } as unknown as IMessageHandler<any>;

    handlerRegistry.register(['my_routing.key'], handler);

    const subjectUnderTest = new InMemoryMessageBus(
      handlerRegistry,
      middlewareRegistry,
      new InMemoryChannel({
        name: 'example.bus',
        avoidErrorsForNotExistedHandlers: false,
      }),
      normalizerRegistry,
      messagingHookHandler,
    );

    const response = await subjectUnderTest.dispatch(
      new RoutingMessage({ title: 'hello' }, 'my_routing.key'),
    );

    expect(defaultMiddleware.process).toHaveBeenCalled();
    expect(response).toEqual({ response: 'response from mocked handler' });
  });
});
