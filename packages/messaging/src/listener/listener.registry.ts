import { BaseRegistry } from '../shared/base-registry';
import { MessagingListener, MessagingListenerHook } from './messaging-listener';

export class ListenerRegistry extends BaseRegistry<MessagingListener> {
  getAllByHook(hook: MessagingListenerHook): MessagingListener[] {
    return this.getAll().filter((listener) => listener.constructor.name.includes(hook));
  }
}
