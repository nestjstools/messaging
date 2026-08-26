import { Middleware } from '../middleware/middleware';

export class DefaultMessageOptions {
  constructor(
    public readonly middlewares: Middleware[] = [],
    public readonly avoidErrorsWhenNotExistedHandler: boolean = false,
    public readonly normalizer?: object,
  ) {}
}
