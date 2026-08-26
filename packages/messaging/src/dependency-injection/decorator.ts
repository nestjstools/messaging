import { ChannelConfig } from '../config';
import { LifecycleHook } from '../lifecycle-hook/messaging-lifecycle-hook-listener';

export const MESSAGE_HANDLER_METADATA = 'MESSAGE_HANDLER_METADATA';
export const CHANNEL_FACTORY_METADATA = 'CHANNEL_FACTORY_METADATA';
export const MESSAGE_BUS_FACTORY_METADATA = 'MESSAGE_BUS_FACTORY_METADATA';
export const MESSAGE_CONSUMER_METADATA = 'MESSAGE_CONSUMER_METADATA';
export const MESSAGING_MIDDLEWARE_METADATA = 'MESSAGING_MIDDLEWARE_METADATA';
export const MESSAGING_NORMALIZER_METADATA = 'MESSAGING_NORMALIZER_METADATA';
export const MESSAGING_EXCEPTION_LISTENER_METADATA =
  'MESSAGING_EXCEPTION_LISTENER_METADATA';
export const MESSAGING_MESSAGE_METADATA = 'MESSAGING_MESSAGE_METADATA';
export const MESSAGING_LIFECYCLE_HOOK_METADATA =
  'MESSAGING_LIFECYCLE_HOOK_METADATA';

export interface MessageHandlerOptions {
  priority?: number;
}

export interface MessageHandlerConfig extends MessageHandlerOptions {
  routingKey: string | string[];
}

export interface MessageHandlerMetadata {
  routingKey: string[];
  options?: MessageHandlerOptions;
}

export function MessageHandler(...routingKey: string[]): ClassDecorator;
export function MessageHandler(
  routingKey: string,
  ...args: [...routingKeys: string[], options: MessageHandlerOptions]
): ClassDecorator;
export function MessageHandler(config: MessageHandlerConfig): ClassDecorator;
export function MessageHandler(...args: unknown[]): ClassDecorator {
  const [firstArgument] = args;
  const isConfig =
    typeof firstArgument === 'object' &&
    firstArgument !== null &&
    'routingKey' in firstArgument;
  const lastArgument = args.at(-1);
  const trailingOptions =
    !isConfig && typeof lastArgument === 'object' && lastArgument !== null
      ? (lastArgument as MessageHandlerOptions)
      : undefined;
  const config = firstArgument as MessageHandlerConfig;
  const { routingKey: configuredRoutingKey, ...configuredOptions } = config;
  const routingKey = isConfig
    ? configuredRoutingKey
    : (trailingOptions ? args.slice(0, -1) : args).map(String);
  const options = isConfig ? configuredOptions : trailingOptions;
  const metadata: MessageHandlerMetadata = {
    routingKey: Array.isArray(routingKey) ? routingKey : [routingKey],
    ...(options && { options }),
  };

  return (target) => {
    Reflect.defineMetadata(MESSAGE_HANDLER_METADATA, metadata, target);
  };
}

export const ChannelFactory = (
  channelConfig: ChannelConfig,
): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(CHANNEL_FACTORY_METADATA, channelConfig, target);
  };
};

export const MessageBusFactory = (channel: any): ClassDecorator => {
  classValidator(channel, 'Channel');

  return (target) => {
    Reflect.defineMetadata(MESSAGE_BUS_FACTORY_METADATA, channel, target);
  };
};

export const MessageConsumer = (channel: any): ClassDecorator => {
  classValidator(channel, 'Channel');

  return (target) => {
    Reflect.defineMetadata(MESSAGE_CONSUMER_METADATA, channel, target);
  };
};

export const MessagingMiddleware = (name?: string): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(
      MESSAGING_MIDDLEWARE_METADATA,
      name ?? target.name,
      target,
    );
  };
};

export const MessagingNormalizer = (name?: string): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(
      MESSAGING_NORMALIZER_METADATA,
      name ?? target.name,
      target,
    );
  };
};

export const MessagingExceptionListener = (): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(
      MESSAGING_EXCEPTION_LISTENER_METADATA,
      target.name,
      target,
    );
  };
};

export const MessagingLifecycleHook = (
  lifecycleHook: LifecycleHook,
): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(
      MESSAGING_LIFECYCLE_HOOK_METADATA,
      `${lifecycleHook}:${target.name}`,
      target,
    );
  };
};

export function DenormalizeMessage(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const paramTypes = Reflect.getMetadata(
      'design:paramtypes',
      target,
      propertyKey,
    );
    const type = paramTypes[parameterIndex];
    Reflect.defineMetadata('message:type', type, target, propertyKey);
  };
}

const classValidator = (value: object, type: string): void => {
  if (Object.getPrototypeOf(value).name !== type) {
    throw new Error(`Given value must be instance of [${type}]`);
  }
};
