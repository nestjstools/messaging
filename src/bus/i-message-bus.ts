import {RoutingMessage} from "../message/routing-message";

export interface IMessageBus {
  dispatch(message: RoutingMessage): Promise<object | void>;
}
