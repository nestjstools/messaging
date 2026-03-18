import { MessagingLifecycleHookRegistry } from '../../../src/lifecycle-hook/messaging-lifecycle-hook.registry';
import {
  LifecycleHook,
  MessagingLifecycleHookListener,
} from '../../../src/lifecycle-hook/messaging-lifecycle-hook-listener';

describe('MessagingLifecycleHookRegistry', () => {
  let registry: MessagingLifecycleHookRegistry;
  let beforeListener: MessagingLifecycleHookListener;
  let afterDenormalizedListener: MessagingLifecycleHookListener;

  beforeEach(() => {
    registry = new MessagingLifecycleHookRegistry();
    beforeListener = {
      on: jest.fn(),
    } as unknown as MessagingLifecycleHookListener;
    afterDenormalizedListener = {
      on: jest.fn(),
    } as unknown as MessagingLifecycleHookListener;
  });

  test('should return listeners only for selected lifecycle hook', () => {
    registry.register(
      `${LifecycleHook.BEFORE_MESSAGE_HANDLER}:BeforeListener`,
      beforeListener,
    );
    registry.register(
      `${LifecycleHook.AFTER_MESSAGE_DENORMALIZED}:AfterDenormalizedListener`,
      afterDenormalizedListener,
    );

    expect(registry.getAllByHook(LifecycleHook.BEFORE_MESSAGE_HANDLER)).toEqual(
      [beforeListener],
    );
  });

  test('should return empty array when no listeners are registered for given lifecycle hook', () => {
    registry.register(
      `${LifecycleHook.BEFORE_MESSAGE_HANDLER}:BeforeListener`,
      beforeListener,
    );

    expect(
      registry.getAllByHook(LifecycleHook.AFTER_MESSAGE_HANDLER_EXECUTED),
    ).toEqual([]);
  });
});
