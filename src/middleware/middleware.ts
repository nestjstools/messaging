import { RoutingMessage } from '../message/routing-message';

export interface Middleware {
  next: (next: RoutingMessage) => Promise<RoutingMessage>;
}
