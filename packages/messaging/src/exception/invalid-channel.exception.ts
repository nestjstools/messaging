import { MessagingException } from './messaging.exception.js';

export class InvalidChannelException extends MessagingException {
  constructor(expectedChannelConfigName: string) {
    super(
      `Invalid Channel. Expected Channel is [${expectedChannelConfigName}]`,
    );
  }
}
