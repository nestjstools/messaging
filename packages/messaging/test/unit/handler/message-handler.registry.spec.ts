import { vi } from 'vitest';
import { MessageHandlerRegistry } from '../../../src/handler/message-handler.registry.js';
import { IMessageHandler } from '../../../src.js';
import { HandlerForMessageNotFoundException } from '../../../src/exception/handler-for-message-not-found.exception.js';

describe('MessageHandlerRegistry', () => {
  let registry: MessageHandlerRegistry;
  let mockHandler: IMessageHandler<any>;

  beforeEach(() => {
    registry = new MessageHandlerRegistry();
    mockHandler = { handle: vi.fn() } as IMessageHandler<any>;
  });

  test('should register a handler for a given name', () => {
    registry.register(['testEvent'], mockHandler);
    expect(registry.getByRoutingKey('testEvent')).toContainEqual({
      handler: mockHandler,
      priority: 0,
    });
  });

  test('should not register the same handler twice for the same name', () => {
    registry.register(['testEvent'], mockHandler);
    registry.register(['testEvent'], mockHandler);
    expect(registry.getByRoutingKey('testEvent').length).toBe(1);
  });

  test('should throw an exception if no handler is found for a routing key', () => {
    expect(() => registry.getByRoutingKey('unknownEvent')).toThrow(
      HandlerForMessageNotFoundException,
    );
  });
});
