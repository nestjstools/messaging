import { RoutingMessage } from '../message/routing-message.js';
import { MiddlewareContext } from './middleware.context.js';

export interface Middleware {
  process(
    message: RoutingMessage,
    context: MiddlewareContext,
  ): Promise<MiddlewareContext>;
}
