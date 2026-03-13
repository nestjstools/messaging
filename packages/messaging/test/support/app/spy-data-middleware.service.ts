import {
  MessagingMiddleware,
  Middleware,
  MiddlewareContext,
  RoutingMessage,
} from '../../../src';
import { Injectable } from '@nestjs/common';
import { SpyDataService } from './spy-data.service';

@Injectable()
@MessagingMiddleware('spy_logger_middleware')
export class SpyDataMiddleware implements Middleware {
  constructor(private readonly spyDataService: SpyDataService) {}

  async process(
    message: RoutingMessage,
    context: MiddlewareContext,
  ): Promise<MiddlewareContext> {
    this.spyDataService.spy('MIDDLEWARE WORKS');
    return context.next().process(message, context);
  }
}
