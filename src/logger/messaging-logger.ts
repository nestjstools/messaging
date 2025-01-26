export interface MessagingLogger {
  error(message: string): void;
  log(message: string): void;
  debug(message: string): void;
}
