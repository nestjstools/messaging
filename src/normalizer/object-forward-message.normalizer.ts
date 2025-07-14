import { MessageNormalizer } from './message-normalizer';
import { MessagingNormalizer } from '../dependency-injection/decorator';

@MessagingNormalizer()
export class ObjectForwardMessageNormalizer implements MessageNormalizer {
  async normalize(message: object, type: string): Promise<string | object> {
    return message;
  }

  async denormalize(message: string | object, type: string): Promise<object> {
    if (typeof message !== 'object') {
      throw new Error('Unable to denormalize object');
    }

    return message;
  }
}
