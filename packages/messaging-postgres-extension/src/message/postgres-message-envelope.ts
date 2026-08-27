export interface PostgresMessageEnvelope {
  payload: object | string;
  routingKey: string;
}
