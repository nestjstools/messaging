import { ObjectForwardMessageNormalizer } from './normalizer/object-forward-message.normalizer';
import { Type } from '@nestjs/common';
import { DynamicModule } from '@nestjs/common/interfaces/modules/dynamic-module.interface';
import { ForwardReference } from '@nestjs/common/interfaces/modules/forward-reference.interface';
import { MessagingLogger } from './logger/messaging-logger';

export type DefineChannels = ChannelConfig[];

export interface MessagingModuleOptions extends MandatoryMessagingModuleOptions {
  /**
   * @description
   * An array of channel configurations, where each channel is defined with its specific settings.
   * This allows you to set up multiple channels with different behaviors and middleware.
   */
  channels?: DefineChannels;
}

/**
 * @description
 * Configuration for a messaging bus.
 * Each bus is identified by a unique name and is associated with one or more channels.
 * Define buses if you want to enable sending messages over specific channels.
 */
export interface DefineBusOption {
  /**
   * @description
   * Unique name of your bus
   */
  name: string;
  /**
   * @description
   * List of channel names the message will be sent through.
   */
  channels: string[];
}

export class ChannelConfig {
  /**
   * @description
   * If true, suppresses errors when no handler is found for a message on this channel.
   * Useful for optional or loosely coupled message handling.
   */
  public readonly avoidErrorsForNotExistedHandlers?: boolean;
  /**
   * @description
   * An array of middleware objects to be applied to messages passing through this channel.
   * Middleware can be used for logging, transformation, validation, etc.
   */
  public readonly middlewares?: object[];
  /**
   * @description
   * Enables or disables the consumer (listener) for this channel.
   * If set to false, the channel will not actively consume messages.
   */
  public readonly enableConsumer?: boolean;
  /**
   * @description
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
    this.avoidErrorsForNotExistedHandlers =
      avoidErrorsForNotExistedHandlers ?? false;
    this.middlewares = middlewares ?? [];
    this.enableConsumer = enableConsumer ?? true;
    this.normalizer = normalizer ?? ObjectForwardMessageNormalizer;
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
    super(
      name,
      avoidErrorsForNotExistedHandlers,
      middlewares,
      enableConsumer,
      normalizer,
    );
  }
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
  imports?: Array<
    Type | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
}

/**
 * @description
 * Base configuration options for the MessagingModule.
 * These options control core behaviors such as debugging, logging, buses and global registration.
 */
export interface MandatoryMessagingModuleOptions {
  /**
   * @description
   * An array of bus definitions, where each bus specifies a unique name and the channels it uses.
   * This allows you to organize message sending across different channels under named buses.
   */
  buses?: DefineBusOption[];
  /**
   * @description
   * If true, enables debug mode which may provide more verbose logging and error messages.
   * Useful during development to trace message flow and identify issues.
   */
  debug?: boolean;
  /**
   * @description
   * If true, forces all channels to disable their consumers (listeners), effectively preventing any message handling.
   * This can be useful in scenarios where you want to temporarily disable message processing without changing individual channel configurations.
   * Note: This will override the `enableConsumer` setting of each channel. InMemoryChannelConfig will ignore this option and will always have the consumer enabled.
   */
  forceDisableAllConsumers?: boolean;
  logging?: boolean;
  /**
   * @description
   * If true, registers the MessagingModule globally, making its services available across the entire application without needing to import it in every module.
   */
  global?: boolean;
  /**
   * @description
   * Custom logger instance or configuration object to be used by the messaging system for logging purposes.
   * This allows you to integrate with your existing logging infrastructure or customize log output.
   * If not provided, a default logger will be used.
   */
  customLogger?: MessagingLogger | object;
}
