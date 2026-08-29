import { Channel } from './channel.js';
import { ChannelConfig } from '../config.js';

export interface IChannelFactory<T extends ChannelConfig> {
  create(channelConfig: T): Channel<T>;
}
