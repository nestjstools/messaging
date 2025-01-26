export interface ConsumerMessageDispatcher {
  dispatch(message: object): void;
}
