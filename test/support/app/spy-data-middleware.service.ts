import { MessagingMiddleware, Middleware, RoutingMessage } from '../../../src';
import { Injectable, Logger } from '@nestjs/common';
import { SpyDataService } from './spy-data.service';

@Injectable()
@MessagingMiddleware('spy_logger_middleware')
export class SpyDataMiddleware implements Middleware {
  constructor(private readonly spyDataService: SpyDataService) {
  }

  next(next: RoutingMessage): Promise<RoutingMessage> {
    this.spyDataService.spy('MIDDLEWARE WORKS');
    return Promise.resolve(undefined);
  }
}
