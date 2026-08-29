import { Channel } from './channel.js';
import { MessagingLogger } from '../logger/messaging-logger.js';
import { MessagingException } from '../exception/messaging.exception.js';

export class ChannelRegistry {
  private registry: Map<string, Channel<any>> = new Map();

  constructor(
    channels: Channel<any>[],
    private logger: MessagingLogger,
  ) {
    channels.forEach((channel) => {
      this.register(channel);
      this.logger.log(`Channel [${channel.config.name}] was registered`);
    });
  }

  register(channel: Channel<any>): void {
    if (this.registry.has(channel.config.name)) {
      return;
    }

    this.registry.set(channel.config.name, channel);
  }

  getByName(name: string): Channel<any> {
    if (!this.registry.has(name)) {
      throw new MessagingException(`There is no channel with name: ${name}`);
    }

    return this.registry.get(name);
  }

  getAll(): Channel<any>[] {
    return Array.from(this.registry.values());
  }
}
