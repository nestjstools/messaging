import { BaseRegistry } from '../shared/base-registry.js';
import {
  MessagingLifecycleHookListener,
  LifecycleHook,
} from './messaging-lifecycle-hook-listener.js';

export class MessagingLifecycleHookRegistry extends BaseRegistry<MessagingLifecycleHookListener> {
  getAllByHook(hook: LifecycleHook): MessagingLifecycleHookListener[] {
    const result: MessagingLifecycleHookListener[] = [];

    for (const [key, listener] of this.registry.entries()) {
      //Because pattern is `${hook}:${target.name}`,
      const name = key.split(':')[0];
      if (name.includes(hook)) {
        result.push(listener);
      }
    }

    return result;
  }
}
