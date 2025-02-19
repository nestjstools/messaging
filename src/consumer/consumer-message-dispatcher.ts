export interface ConsumerMessageDispatcher {
  dispatch(message: object|string): void;
}
