import { ExceptionContext } from './exception-context.js';

export interface ExceptionListener {
  onException(context: ExceptionContext): Promise<void>;
}
