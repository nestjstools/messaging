import { MessageOptions } from './message-options';
import { Middleware } from '../middleware/middleware';

export class DefaultMessageOptions implements MessageOptions {
  constructor(
    public readonly middlewares: Middleware[] = [],
    public readonly avoidErrorsWhenNotExistedHandler: boolean = false,
    public readonly normalizer?: object,
    public readonly enableParallelHandling: boolean = false,
  ) {}
}
