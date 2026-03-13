import { MESSAGING_MIDDLEWARE_METADATA } from '../dependency-injection/decorator';

export class DecoratorExtractor {
  static extractMessageMiddleware(instance: object): string {
    return Reflect.getMetadata(
      MESSAGING_MIDDLEWARE_METADATA,
      instance,
    ) as string;
  }
}
