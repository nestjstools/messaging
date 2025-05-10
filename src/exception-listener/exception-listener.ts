export interface ExceptionListener {
  onException(exception: Error, message: object, routingKey: string, channelName: string): Promise<void>;
}
