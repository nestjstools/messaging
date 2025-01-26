import { Channel } from './channel';
import { MessagingLogger } from '../logger/messaging-logger';
import { ChannelType } from '../config';

export class ChannelRegistry {
  private registry: Map<string, Channel> = new Map();

  constructor(
    channels: Channel[],
    private logger: MessagingLogger,
  ) {
    channels.forEach((channel) => {
      this.register(channel);
      this.logger.log(`Channel [${channel.config.name}] was registered`);
    });
  }

  register(channel: Channel): void {
    if (this.registry.has(channel.config.name)) {
      return;
    }

    this.registry.set(channel.config.name, channel);
  }

  getByName(name: string): Channel {
    if (!this.registry.has(name)) {
      throw new Error(`There is no channel with name: ${name}`);
    }

    return this.registry.get(name);
  }

  getAllByType(type: ChannelType): Channel[] {
    return Array.from(this.registry.values()).filter((channel) => {
      if (type === ChannelType.AMQP) {
        return channel;
      }
    });
  }

  getALl(): Channel[] {
    return Array.from(this.registry.values());
  }
}
