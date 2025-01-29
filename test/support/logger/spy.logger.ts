import { NestLogger } from '../../../src/logger/nest-logger';

export class SpyLogger extends NestLogger {
  private logsCollection: Log[] = [];

  error(message: string) {
    this.logsCollection.push({ type: 'ERROR', content: message });
    super.error(message);
  }

  log(message: string) {
    this.logsCollection.push({ type: 'LOG', content: message });
    super.log(message);
  }

  debug(message: string) {
    this.logsCollection.push({ type: 'DEBUG', content: message });
    super.debug(message);
  }

  getLogs(): Log[] {
    return this.logsCollection;
  }
}

interface Log {
  type: string;
  content: string;
}
