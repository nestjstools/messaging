import { MiddlewareRegistry } from '../../../src/middleware/middleware.registry';
import { Middleware } from '../../../src';
import { MessagingException } from '../../../src/exception/messaging.exception';

describe('MiddlewareRegistry', () => {
  let registry: MiddlewareRegistry;
  let mockMiddleware: Middleware;

  beforeEach(() => {
    registry = new MiddlewareRegistry();
    mockMiddleware = { execute: jest.fn() } as unknown as Middleware;
  });

  test('should register a middleware for a given name', () => {
    registry.register('testMiddleware', mockMiddleware);
    expect(registry.getByName('testMiddleware')).toBe(mockMiddleware);
  });

  test('should not register the same middleware twice for the same name', () => {
    registry.register('testMiddleware', mockMiddleware);
    registry.register('testMiddleware', mockMiddleware);
    expect(registry.getAll().length).toBe(1);
  });

  test('should throw an exception if no middleware is found for a given name', () => {
    expect(() => registry.getByName('unknownMiddleware')).toThrow(
      MessagingException,
    );
  });

  test('should retrieve all registered middleware', () => {
    const anotherMockMiddleware = {
      execute: jest.fn(),
    } as unknown as Middleware;
    registry.register('middleware1', mockMiddleware);
    registry.register('middleware2', anotherMockMiddleware);
    expect(registry.getAll()).toEqual([mockMiddleware, anotherMockMiddleware]);
  });
});
