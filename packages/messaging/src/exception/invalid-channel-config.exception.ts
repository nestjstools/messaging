import { MessagingException } from './messaging.exception.js';

export class InvalidChannelConfigException extends MessagingException {
  constructor(expectedChannelName: string) {
    super(
      `Invalid ChannelConfig. Expected ChannelConfig is [${expectedChannelName}]`,
    );
  }
}
