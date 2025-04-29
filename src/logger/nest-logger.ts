import { Injectable, LoggerService } from '@nestjs/common';
import { MessagingLogger } from './messaging-logger';
import { Log } from './log';

@Injectable()
export class NestLogger implements MessagingLogger {
  private static MODULE_NAME: string = 'MessagingModule';

  constructor(
    private readonly logger: LoggerService,
    private readonly debugEnabled: boolean,
    private readonly logEnabled: boolean,
  ) {}

  error(message: string|Log): void {
    this.logger.error(this.makeLog(message), NestLogger.MODULE_NAME);
  }

  log(message: string|Log): void {
    if (!this.logEnabled) {
      return;
    }

    this.logger.log(this.makeLog(message), NestLogger.MODULE_NAME);
  }

  debug(message: string|Log): void {
    if (!this.debugEnabled) {
      return;
    }

    this.logger.debug(this.makeLog(message), NestLogger.MODULE_NAME);
  }

  private makeLog(message: string|Log): object|string {
    return message instanceof Log ? message.toObject() : message
  }
}
