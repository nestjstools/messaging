export interface MqttMessageEnvelope {
  payload: object | string;
  routingKey: string;
  headers: Record<string, string>;
  timestamp: string;
  messageId: string;
}
