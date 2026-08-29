import { ChannelConfig } from '../config.js';

export class Channel<T extends ChannelConfig> {
  constructor(public readonly config: T) {}

  async onChannelDestroy(): Promise<void> {}
}
