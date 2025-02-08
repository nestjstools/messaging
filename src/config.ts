type DefineChannels = ChannelConfig[];

export interface MessagingModuleOptions {
  messageHandlers?: object[]; //TODO Temporary unsupported
  buses?: DefineBusOption[];
  channels?: DefineChannels;
  debug?: boolean;
  logging?: boolean;
}

interface DefineBusOption {
  name: string;
  channels: string[];
}

export class ChannelConfig {
  public readonly avoidErrorsForNotExistedHandlers?: boolean;
  public readonly middlewares?: object[];
  public readonly enableConsumer?: boolean;

  constructor(
    public readonly name: string,
    avoidErrorsForNotExistedHandlers?: boolean,
    middlewares?: object[],
    enableConsumer?: boolean,
  ) {
    this.avoidErrorsForNotExistedHandlers = avoidErrorsForNotExistedHandlers ?? false;
    this.middlewares = middlewares ?? [];
    this.enableConsumer = enableConsumer ?? true;
  }
}

export class AmqpChannelConfig extends ChannelConfig {
  public readonly connectionUri: string;
  public readonly exchangeName: string;
  public readonly exchangeType: ExchangeType;
  public readonly queue: string;
  public readonly bindingKeys?: string[];
  public readonly autoCreate?: boolean;
  public readonly deadLetterQueueFeature?: boolean;

  constructor({
    name,
    connectionUri,
    exchangeName,
    exchangeType,
    queue,
    enableConsumer,
    bindingKeys,
    autoCreate,
    deadLetterQueueFeature,
    avoidErrorsForNotExistedHandlers,
    middlewares,
  }: AmqpChannelConfig) {
    super(name, avoidErrorsForNotExistedHandlers, middlewares, enableConsumer)
    this.connectionUri = connectionUri;
    this.exchangeName = exchangeName;
    this.exchangeType = exchangeType;
    this.queue = queue;
    this.bindingKeys = bindingKeys;
    this.autoCreate = autoCreate ?? true;
    this.deadLetterQueueFeature = deadLetterQueueFeature ?? false;
  }
}

export class InMemoryChannelConfig extends ChannelConfig {
  constructor({
    name,
    avoidErrorsForNotExistedHandlers,
    middlewares,
  }: InMemoryChannelConfig) {
    super(name, avoidErrorsForNotExistedHandlers, middlewares);
  }
}

export enum ExchangeType {
  TOPIC = 'topic',
  FANOUT = 'fanout',
  DIRECT = 'direct',
}
