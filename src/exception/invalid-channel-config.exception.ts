import { MessagingException } from './messaging.exception';

export class InvalidChannelConfigException extends MessagingException {
  constructor(expectedChannelName: string) {
    super(`Invalid ChannelConfig. Expected ChannelConfig is [${expectedChannelName}]`);
  }
}
