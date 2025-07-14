import { ChannelConfig } from '../config';

export class Channel<T extends ChannelConfig> {
  constructor(public readonly config: T) {}
}
