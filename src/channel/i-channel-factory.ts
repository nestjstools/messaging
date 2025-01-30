import { Channel } from './channel';
import { ChannelConfig } from '../config';

export interface IChannelFactory<T extends ChannelConfig> {
  create(channelConfig: T): Channel<T>;
}
