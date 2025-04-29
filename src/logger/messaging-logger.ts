import { Log } from './log';

export interface MessagingLogger {
  error(message: string|Log): void;
  log(message: string|Log): void;
  debug(message: string|Log): void;
}
