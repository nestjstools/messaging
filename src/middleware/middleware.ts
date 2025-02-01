import { RoutingMessage } from '../message/routing-message';
import { MiddlewareContext } from './middleware.context';

export interface Middleware {
  process(message: RoutingMessage, context: MiddlewareContext): Promise<MiddlewareContext>;
}
