import { MessagingException } from './messaging.exception';

export class UnsupportedChannelFactoryException extends MessagingException {
  constructor(channelConfig: string) {
    super(`Unsupported ChannelFactory for channel [${channelConfig}]`);
  }
}
