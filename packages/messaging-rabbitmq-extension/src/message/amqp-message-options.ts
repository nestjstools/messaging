import { MessageOptions } from '@nestjstools/messaging';
import { Middleware } from '@nestjstools/messaging';

export class AmqpMessageOptions implements MessageOptions {
  constructor(
    public readonly exchangeName: string | undefined = undefined,
    public readonly routingKey: string | undefined = undefined,
    public readonly middlewares: Middleware[] = [],
    public readonly headers: { [key: string]: string } = {},
    public readonly avoidErrorsWhenNotExistedHandler: boolean = undefined,
  ) {}
}
