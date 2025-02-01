import { IMessageHandler, InMemoryMessageBus, Middleware, RoutingMessage } from '../../../src';
import { MessageHandlerRegistry } from '../../../src/handler/message-handler.registry';
import { MiddlewareRegistry } from '../../../src/middleware/middleware.registry';
import { InMemoryChannel } from '../../../src/channel/in-memory.channel';

describe('InMemoryMessageBus', () => {
  let handlerRegistry: MessageHandlerRegistry;
  let middlewareRegistry: MiddlewareRegistry;
  let defaultMiddleware: Middleware;

  beforeEach(async () => {
    handlerRegistry = new MessageHandlerRegistry();
    middlewareRegistry = new MiddlewareRegistry();

    defaultMiddleware = {
      next: jest.fn().mockImplementation(() => {
        return { response: 'response from mocked handler' }
      }),
    } as unknown as Middleware;

    middlewareRegistry.register('HandlerMiddleware', defaultMiddleware)
  });

  it('should not throw error if no handler is mapped for routingKey as default', async () => {
    const subjectUnderTest = new InMemoryMessageBus(
      handlerRegistry,
      middlewareRegistry,
      new InMemoryChannel({
        name: 'example.bus',
      })
    );

   await subjectUnderTest.dispatch(new RoutingMessage({ title: 'hello' }, 'my_routing.key'));
  });

  it('should not throw error if no handler is mapped for routingKey for default.bus', async () => {
    const subjectUnderTest = new InMemoryMessageBus(
      handlerRegistry,
      middlewareRegistry,
      new InMemoryChannel({
        name: 'default.bus',
      })
    );

    await subjectUnderTest.dispatch(new RoutingMessage({ title: 'hello' }, 'my_routing.key'));
  });

  it('should throw error if no handler is mapped for routingKey when in config is set to false', async () => {
    const subjectUnderTest = new InMemoryMessageBus(
      handlerRegistry,
      middlewareRegistry,
      new InMemoryChannel({
        name: 'example.bus',
        avoidErrorsForNotExistedHandlers: false
      })
    );

    await expect(subjectUnderTest.dispatch(new RoutingMessage({ title: 'hello' }, 'my_routing.key')))
      .rejects
      .toThrowError("There is no handlers for this routing key: [my_routing.key]");
  });

  it('should run middleware at the end', async () => {
    const handler = {
      handle: jest.fn(),
    } as unknown as IMessageHandler<any>

    handlerRegistry.register('my_routing.key', handler)

    const subjectUnderTest = new InMemoryMessageBus(
      handlerRegistry,
      middlewareRegistry,
      new InMemoryChannel({
        name: 'example.bus',
        avoidErrorsForNotExistedHandlers: false
      })
    );

    const response = await subjectUnderTest.dispatch(new RoutingMessage({ title: 'hello' }, 'my_routing.key'));

    expect(defaultMiddleware.next).toHaveBeenCalled();
    expect(response).toEqual({"response": "response from mocked handler"});
  });
});
