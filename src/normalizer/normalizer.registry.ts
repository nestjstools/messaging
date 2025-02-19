import { MessageNormalizer } from './message-normalizer';
import { MessagingException } from '../exception/messaging.exception';

export class NormalizerRegistry {
  private registry: Map<string, MessageNormalizer> = new Map();

  register(name: string, element: MessageNormalizer): void {
    if (this.registry.has(name)) {
      return;
    }
    this.registry.set(name, element);
  }

  getByName(name: string): MessageNormalizer {
    if (!this.registry.has(name)) {
      throw new MessagingException(`MessageNormalizer not found with name: ${name}`);
    }

    return this.registry.get(name);
  }

  getALl(): MessageNormalizer[] {
    return Array.from(this.registry.values());
  }
}
