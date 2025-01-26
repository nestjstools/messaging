import { IMessageHandler } from '../handler/i-message.handler';
import { MESSAGE_HANDLER_METADATA } from '../dependency-injection/decorator';

export class DecoratorExtractor {
  static extractMessageHandler(handler: IMessageHandler<any>): string {
    return Reflect.getMetadata(MESSAGE_HANDLER_METADATA, handler) as string;
  }
}
