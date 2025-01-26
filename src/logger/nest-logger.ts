import { Injectable, LoggerService } from '@nestjs/common';
import { MessagingLogger } from './messaging-logger';

@Injectable()
export class NestLogger implements MessagingLogger {
  private static MODULE_NAME: string = 'MessagingModule';

  constructor(
    private readonly logger: LoggerService,
    private readonly debugEnabled: boolean,
    private readonly logEnabled: boolean,
  ) {}

  error(message: string): void {
    this.logger.error(message, NestLogger.MODULE_NAME);
  }

  log(message: string): void {
    if (!this.logEnabled) {
      return;
    }

    this.logger.log(message, NestLogger.MODULE_NAME);
  }

  debug(message: string): void {
    if (!this.debugEnabled) {
      return;
    }

    this.logger.debug(message, NestLogger.MODULE_NAME);
  }
}
