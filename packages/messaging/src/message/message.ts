export interface Message {
  message: object | string;
  messageRoutingKey: string;
  messageOptions?: unknown;
}
