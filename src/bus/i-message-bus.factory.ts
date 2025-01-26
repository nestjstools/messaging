import { Channel } from '../channel/channel';
import { IMessageBus } from './i-message-bus';

export interface IMessageBusFactory {
  create(channel: Channel): IMessageBus;
}
