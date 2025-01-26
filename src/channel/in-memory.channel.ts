import { ChannelConfig, InMemoryChannelConfig } from '../config';
import { Channel } from './channel';

export class InMemoryChannel implements Channel {
  public readonly config: InMemoryChannelConfig;

  constructor(config: ChannelConfig) {
    if (!(config instanceof InMemoryChannelConfig)) {
      throw new Error();
    }

    this.config = config;
  }
}
