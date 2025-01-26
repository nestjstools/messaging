import { ChannelConfig } from '../config';

export const MESSAGE_HANDLER_METADATA = 'MESSAGE_HANDLER_METADATA';
export const CHANNEL_FACTORY_METADATA = 'CHANNEL_FACTORY_METADATA';
export const MESSAGE_BUS_FACTORY_METADATA = 'MESSAGE_BUS_FACTORY_METADATA';
export const MESSAGE_CONSUMER_METADATA = 'MESSAGE_CONSUMER_METADATA';

export const MessageHandler = (routingKey: string): ClassDecorator => {
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
  return (target: Function) => {
    Reflect.defineMetadata(MESSAGE_BUS_FACTORY_METADATA, channel, target);
  };
};

export const MessageConsumer = (channel: any): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata(MESSAGE_CONSUMER_METADATA, channel, target);
  };
};
