import { MessageOptions } from '@nestjstools/messaging';

export class GooglePubSubMessageOptions implements MessageOptions {
  public readonly middlewares: any[] = [];
  public readonly avoidErrorsWhenNotExistedHandler: boolean = false;

  constructor(public readonly attributes: { [key: string]: string } = {}) {}
}
