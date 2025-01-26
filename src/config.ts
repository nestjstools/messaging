type DefineChannels = AmqpChannelConfig[] | InMemoryChannelConfig[];

export interface MessagingModuleOptions {
  messageHandlers: object[];
  buses?: DefineBusOption[];
  channels?: DefineChannels;
  debug?: boolean;
  logging?: boolean;
}

interface DefineBusOption {
  name: string;
  channels: string[];
}

export class AmqpChannelConfig implements ChannelConfig {
  public readonly name: string;
  public readonly connectionUri: string;
  public readonly exchangeName: string;
  public readonly exchangeType: ExchangeType;
  public readonly queue: string;
  public readonly bindingKeys?: string[];
  public readonly enableConsumer?: boolean;
  public readonly autoCreate?: boolean;
  public readonly deadLetterQueueFeature?: boolean;
  public readonly avoidErrorsForNotExistedHandlers?: boolean;
  public readonly middlewares?: object[];

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
    this.name = name;
    this.connectionUri = connectionUri;
    this.exchangeName = exchangeName;
    this.exchangeType = exchangeType;
    this.queue = queue;
    this.bindingKeys = bindingKeys;
    this.enableConsumer = enableConsumer ?? true;
    this.autoCreate = autoCreate ?? true;
    this.deadLetterQueueFeature = deadLetterQueueFeature ?? true;
    this.avoidErrorsForNotExistedHandlers =
      avoidErrorsForNotExistedHandlers ?? false;
    this.middlewares = middlewares ?? [];
  }
}

export class InMemoryChannelConfig implements ChannelConfig {
  public readonly name: string;
  public readonly avoidErrorsForNotExistedHandlers?: boolean;
  public readonly middlewares?: object[];

  constructor({
    name,
    avoidErrorsForNotExistedHandlers,
    middlewares,
  }: InMemoryChannelConfig) {
    this.name = name;
    this.avoidErrorsForNotExistedHandlers =
      avoidErrorsForNotExistedHandlers ?? false;
    this.middlewares = middlewares ?? [];
  }
}

export class ChannelConfig {
  name: string;
  avoidErrorsForNotExistedHandlers?: boolean;
  middlewares?: object[];
  enableConsumer?: boolean;
}

export interface Consumer {
  name: string;
}

export enum ChannelType {
  AMQP = 'AMQP',
  IN_MEMORY = 'IN_MEMORY',
}

export enum ExchangeType {
  TOPIC = 'topic',
  FANOUT = 'fanout',
  DIRECT = 'direct',
  HEADER = 'headers',
}
