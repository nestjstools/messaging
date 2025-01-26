import { ChannelConfig } from '../config';
import { Channel } from './channel';

export interface IChannelFactory {
  create(channelConfig: ChannelConfig): Channel;
}
