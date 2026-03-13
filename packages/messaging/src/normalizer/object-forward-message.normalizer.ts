import { MessageNormalizer } from './message-normalizer';
import { MessagingNormalizer } from '../dependency-injection/decorator';
import { MessagingException } from '../exception/messaging.exception';

@MessagingNormalizer()
export class ObjectForwardMessageNormalizer implements MessageNormalizer {
  async normalize(message: object, type: string): Promise<string | object> {
    return message;
  }

  async denormalize(message: string | object, type: string): Promise<object> {
    if (typeof message !== 'object') {
      throw new MessagingException('Unable to denormalize object');
    }

    return message;
  }
}
