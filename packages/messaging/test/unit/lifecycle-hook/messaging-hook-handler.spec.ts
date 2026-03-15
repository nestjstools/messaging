import { MessagingLifecycleHookHandler } from '../../../src/lifecycle-hook/messaging-lifecycle-hook-handler';
import { MessagingLifecycleHookRegistry } from '../../../src/lifecycle-hook/messaging-lifecycle-hook.registry';
import {
  LifecycleHook,
  MessagingLifecycleHookListener,
} from '../../../src/lifecycle-hook/messaging-lifecycle-hook-listener';
import { RoutingMessage } from '../../../src/message/routing-message';

describe('MessagingHookHandler', () => {
  let hookRegistry: MessagingLifecycleHookRegistry;
  let handler: MessagingLifecycleHookHandler;
  let listener: MessagingLifecycleHookListener;
  const message = new RoutingMessage({ title: 'hello' }, 'test.key');

  beforeEach(() => {
    hookRegistry = {
      getAllByHook: jest.fn(),
    } as unknown as MessagingLifecycleHookRegistry;

    handler = new MessagingLifecycleHookHandler(hookRegistry);
    listener = { on: jest.fn().mockResolvedValue(undefined) };
  });

  test('should execute listeners for AFTER_MESSAGE_DENORMALIZED hook', async () => {
    (hookRegistry.getAllByHook as jest.Mock).mockReturnValue([listener]);

    await handler.handleAfterMessageDenormalized(message);

    expect(hookRegistry.getAllByHook).toHaveBeenCalledWith(
      LifecycleHook.AFTER_MESSAGE_DENORMALIZED,
    );
    expect(listener.on).toHaveBeenCalledWith(message);
  });

  test('should execute listeners for BEFORE_MESSAGE_HANDLER hook', async () => {
    (hookRegistry.getAllByHook as jest.Mock).mockReturnValue([listener]);

    await handler.handleBeforeMessageHandler(message);

    expect(hookRegistry.getAllByHook).toHaveBeenCalledWith(
      LifecycleHook.BEFORE_MESSAGE_HANDLER,
    );
    expect(listener.on).toHaveBeenCalledWith(message);
  });

  test('should execute listeners for AFTER_MESSAGE_HANDLER_EXECUTED hook', async () => {
    (hookRegistry.getAllByHook as jest.Mock).mockReturnValue([listener]);

    await handler.handleAfterMessageHandlerExecuted(message);

    expect(hookRegistry.getAllByHook).toHaveBeenCalledWith(
      LifecycleHook.AFTER_MESSAGE_HANDLER_EXECUTED,
    );
    expect(listener.on).toHaveBeenCalledWith(message);
  });
});
