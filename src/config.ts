import { ObjectForwardMessageNormalizer } from './normalizer/object-forward-message.normalizer';
import { Type } from '@nestjs/common';
import { DynamicModule } from '@nestjs/common/interfaces/modules/dynamic-module.interface';
import { ForwardReference } from '@nestjs/common/interfaces/modules/forward-reference.interface';

export type DefineChannels = ChannelConfig[];

export interface MessagingModuleOptions extends MandatoryMessagingModuleOptions {
  channels?: DefineChannels;
}

/**
 * Configuration for a messaging bus.
 * Each bus is identified by a unique name and is associated with one or more channels.
 * Define buses if you want to enable sending messages over specific channels.
 */
export interface DefineBusOption {
  /**
   * Unique name of your bus
   */
  name: string;
  /**
   * List of channel names the message will be sent through.
   */
  channels: string[];
}

export class ChannelConfig {
  /**
   * If true, suppresses errors when no handler is found for a message on this channel.
   * Useful for optional or loosely coupled message handling.
   */
  public readonly avoidErrorsForNotExistedHandlers?: boolean;
  /**
   * An array of middleware objects to be applied to messages passing through this channel.
   * Middleware can be used for logging, transformation, validation, etc.
   */
  public readonly middlewares?: object[];
  /**
   * Enables or disables the consumer (listener) for this channel.
   * If set to false, the channel will not actively consume messages.
   */
  public readonly enableConsumer?: boolean;
  /**
   * Optional message normalizer to process or transform messages before they are handled & before send.
   * Can be used to enforce consistent message structure.
   */
  public readonly normalizer?: object;

  constructor(
    public readonly name: string,
    avoidErrorsForNotExistedHandlers?: boolean,
    middlewares?: object[],
    enableConsumer?: boolean,
    normalizer?: object,
  ) {
    this.avoidErrorsForNotExistedHandlers = avoidErrorsForNotExistedHandlers ?? false;
    this.middlewares = middlewares ?? [];
    this.enableConsumer = enableConsumer ?? true;
    this.normalizer = normalizer ?? ObjectForwardMessageNormalizer;
  }
}

/**
 * @deprecated Will be removed in version 3.x - use RmqChannelConfig from @nestjstools/messaging-rabbitmq-extension version 2.11+
 */
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
    normalizer,
  }: AmqpChannelConfig) {
    super(name, avoidErrorsForNotExistedHandlers, middlewares, enableConsumer, normalizer)
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
    enableConsumer,
    normalizer,
  }: InMemoryChannelConfig) {
    super(name, avoidErrorsForNotExistedHandlers, middlewares, enableConsumer, normalizer);
  }
}

export enum ExchangeType {
  TOPIC = 'topic',
  FANOUT = 'fanout',
  DIRECT = 'direct',
}

/**
 * @description
 * Allows asynchronous configuration of messaging channels, similar to NestJS's `useFactory` pattern.
 * Use this to define your channels dynamically, possibly depending on other injected services.
 * Note: Buses and other options must be configured in sync way.
 */
export interface MessagingModuleAsyncOptions extends MandatoryMessagingModuleOptions {
  inject?: Array<Type | string | symbol>;
  useChannelFactory: (...args) => Promise<DefineChannels> | DefineChannels;
  imports?: Array<Type | DynamicModule | Promise<DynamicModule> | ForwardReference>;
}

/**
 * @description
 * Base configuration options for the MessagingModule.
 * These options control core behaviors such as debugging, logging, buses and global registration.
 */
export interface MandatoryMessagingModuleOptions {
  buses?: DefineBusOption[];
  debug?: boolean;
  logging?: boolean;
  global?: boolean;
}
