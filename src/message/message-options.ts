import { Middleware } from '../middleware/middleware';

export interface MessageOptions {
  middlewares: Middleware[];
  avoidErrorsWhenNotExistedHandler: boolean,
}
