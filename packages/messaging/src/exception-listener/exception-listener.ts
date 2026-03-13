import { ExceptionContext } from './exception-context';

export interface ExceptionListener {
  onException(context: ExceptionContext): Promise<void>;
}
