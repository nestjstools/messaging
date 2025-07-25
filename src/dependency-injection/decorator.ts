import { ChannelConfig } from '../config';

export const MESSAGE_HANDLER_METADATA = 'MESSAGE_HANDLER_METADATA';
export const CHANNEL_FACTORY_METADATA = 'CHANNEL_FACTORY_METADATA';
export const MESSAGE_BUS_FACTORY_METADATA = 'MESSAGE_BUS_FACTORY_METADATA';
export const MESSAGE_CONSUMER_METADATA = 'MESSAGE_CONSUMER_METADATA';
export const MESSAGING_MIDDLEWARE_METADATA = 'MESSAGING_MIDDLEWARE_METADATA';
export const MESSAGING_NORMALIZER_METADATA = 'MESSAGING_NORMALIZER_METADATA';
export const MESSAGING_EXCEPTION_LISTENER_METADATA =
  'MESSAGING_EXCEPTION_LISTENER_METADATA';
export const MESSAGING_MESSAGE_METADATA = 'MESSAGING_MESSAGE_METADATA';

export const MessageHandler = (...routingKey: string[]): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata(MESSAGE_HANDLER_METADATA, routingKey, target);
  };
};

export const ChannelFactory = (
  channelConfig: ChannelConfig,
): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata(CHANNEL_FACTORY_METADATA, channelConfig, target);
  };
};

export const MessageBusFactory = (channel: any): ClassDecorator => {
  classValidator(channel, 'Channel');

  return (target: Function) => {
    Reflect.defineMetadata(MESSAGE_BUS_FACTORY_METADATA, channel, target);
  };
};

export const MessageConsumer = (channel: any): ClassDecorator => {
  classValidator(channel, 'Channel');

  return (target: Function) => {
    Reflect.defineMetadata(MESSAGE_CONSUMER_METADATA, channel, target);
  };
};

export const MessagingMiddleware = (name?: string): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata(
      MESSAGING_MIDDLEWARE_METADATA,
      name ?? target.name,
      target,
    );
  };
};

export const MessagingNormalizer = (name?: string): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata(
      MESSAGING_NORMALIZER_METADATA,
      name ?? target.name,
      target,
    );
  };
};

export const MessagingExceptionListener = (): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata(
      MESSAGING_EXCEPTION_LISTENER_METADATA,
      target.name,
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
