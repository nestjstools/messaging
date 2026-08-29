import { type Mocked, type Mock, vi } from 'vitest';
import { MessagingLifecycleHookHandler } from '../../../src/lifecycle-hook/messaging-lifecycle-hook-handler.js';
import { MessagingLifecycleHookRegistry } from '../../../src/lifecycle-hook/messaging-lifecycle-hook.registry.js';
import {
  HookMessage,
  LifecycleHook,
  MessagingLifecycleHookListener,
  RoutingMessage,
} from '../../../src.js';

describe('MessagingHookHandler', () => {
  let hookRegistry: Mocked<MessagingLifecycleHookRegistry>;
  let handler: MessagingLifecycleHookHandler;
  let listener: MessagingLifecycleHookListener;
  const message = new RoutingMessage({ title: 'hello' }, 'test.key');

  beforeEach(() => {
    hookRegistry = {
      getAllByHook: vi.fn(),
    } as unknown as Mocked<MessagingLifecycleHookRegistry>;

    handler = new MessagingLifecycleHookHandler(hookRegistry);
    listener = { hook: vi.fn().mockResolvedValue(undefined) };
  });

  test('should execute listeners for AFTER_MESSAGE_DENORMALIZED hook', async () => {
    (hookRegistry.getAllByHook as Mock).mockReturnValue([listener]);

    const hookMessage = HookMessage.fromRoutingMessage(
      message,
      'example',
      'example',
    );

    await handler.handleAfterMessageDenormalized(hookMessage);

    expect(hookRegistry.getAllByHook).toHaveBeenCalledWith(
      LifecycleHook.AFTER_MESSAGE_DENORMALIZED,
    );
    expect(listener.hook).toHaveBeenCalledWith(hookMessage);
  });

  test('should execute listeners for BEFORE_MESSAGE_HANDLER hook', async () => {
    (hookRegistry.getAllByHook as Mock).mockReturnValue([listener]);

    const hookMessage = HookMessage.fromRoutingMessage(
      message,
      'example',
      'example',
    );

    await handler.handleBeforeMessageHandler(hookMessage);

    expect(hookRegistry.getAllByHook).toHaveBeenCalledWith(
      LifecycleHook.BEFORE_MESSAGE_HANDLER,
    );
    expect(listener.hook).toHaveBeenCalledWith(hookMessage);
  });

  test('should execute listeners for AFTER_MESSAGE_HANDLER_EXECUTED hook', async () => {
    (hookRegistry.getAllByHook as Mock).mockReturnValue([listener]);

    const hookMessage = HookMessage.fromRoutingMessage(
      message,
      'example',
      'example',
    );

    await handler.handleAfterMessageHandlerExecuted(hookMessage);

    expect(hookRegistry.getAllByHook).toHaveBeenCalledWith(
      LifecycleHook.AFTER_MESSAGE_HANDLER_EXECUTION,
    );
    expect(listener.hook).toHaveBeenCalledWith(hookMessage);
  });
});
