export class AmqpMessageBuilder {
  private constructor(
    private exchangeName?: string,
    private routingKey?: string,
    private headers?: { [key: string]: any },
    private message?: object,
  ) {}

  static create(): AmqpMessageBuilder {
    return new AmqpMessageBuilder();
  }

  withExchangeName(exchangeName: string): AmqpMessageBuilder {
    this.exchangeName = exchangeName;
    return this;
  }

  withRoutingKey(routingKey: string): AmqpMessageBuilder {
    this.routingKey = routingKey;
    return this;
  }

  withHeaders(headers: { [key: string]: any }): AmqpMessageBuilder {
    this.headers = headers;
    return this;
  }

  addHeader(key: string, value: any): AmqpMessageBuilder {
    if (!this.headers) {
      this.headers = {};
    }
    this.headers[key] = value;
    return this;
  }

  withMessage(message: object): AmqpMessageBuilder {
    this.message = message;
    return this;
  }

  buildMessage(): AmqpMessage {
    if (!this.exchangeName) {
      throw new Error('Exchange name must be defined');
    }

    if (!this.routingKey) {
      throw new Error('Routing key must be defined');
    }

    if (!this.message) {
      throw new Error('Message must be defined');
    }

    return {
      message: this.message,
      envelope: {
        exchange: this.exchangeName,
        routingKey: this.routingKey,
        headers: this.headers ?? {},
      },
    };
  }
}

export interface AmqpMessage {
  message: object;
  envelope: {
    exchange: string;
    routingKey: string;
    headers?: { [key: string]: any };
  };
}
