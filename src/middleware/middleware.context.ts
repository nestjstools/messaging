import { Middleware } from './middleware';

export class MiddlewareContext {
  private constructor(
    private readonly middlewares: Middleware[],
    private index: number,
  ) {}

  static createFresh(middlewares: Middleware[]): MiddlewareContext {
    return new MiddlewareContext(middlewares, 0);
  }

  next(): Middleware {
    this.index++;
    return this.middlewares[this.index];
  }
}
