interface AmqpMessageOptionsProps {
  exchangeName?: string;
  routingKey?: string;
  headers?: { [key: string]: string };
}

export class AmqpMessageOptions {
  public readonly exchangeName?: string;
  public readonly routingKey?: string;
  public readonly headers: { [key: string]: string };

  constructor(props?: AmqpMessageOptionsProps);
  /** @deprecated Use the object-form constructor. This overload will be removed in the next major version. */
  constructor(
    exchangeName?: string,
    routingKey?: string,
    headers?: { [key: string]: string },
  );
  constructor(
    propsOrExchangeName?: AmqpMessageOptionsProps | string,
    routingKey?: string,
    headers: { [key: string]: string } = {},
  ) {
    if (typeof propsOrExchangeName === 'string' || arguments.length > 1) {
      this.exchangeName = propsOrExchangeName as string | undefined;
      this.routingKey = routingKey;
      this.headers = headers;
      return;
    }

    this.exchangeName = propsOrExchangeName?.exchangeName;
    this.routingKey = propsOrExchangeName?.routingKey;
    this.headers = propsOrExchangeName?.headers ?? {};
  }
}
