import { InMemoryMessageBusFactory } from '../../../src/bus/in-memory-message-bus.factory';
import { MessageHandlerRegistry } from '../../../src/handler/message-handler.registry';
import { MiddlewareRegistry } from '../../../src/middleware/middleware.registry';
import { InMemoryChannel } from '../../../src/channel/in-memory.channel';
import { InMemoryMessageBus } from '../../../src';

describe('InMemoryMessageBusFactory', () => {
  let factory: InMemoryMessageBusFactory;
  let mockRegistry: MessageHandlerRegistry;
  let mockMiddlewareRegistry: MiddlewareRegistry;
  let mockChannel: InMemoryChannel;

  beforeEach(() => {
    mockRegistry = {} as MessageHandlerRegistry;
    mockMiddlewareRegistry = {} as MiddlewareRegistry;
    factory = new InMemoryMessageBusFactory(mockRegistry, mockMiddlewareRegistry);
    mockChannel = {} as InMemoryChannel;
  });

  test('should create an InMemoryMessageBus when given valid dependencies', () => {
    const bus = factory.create(mockChannel);
    expect(bus).toBeInstanceOf(InMemoryMessageBus);
  });
});
