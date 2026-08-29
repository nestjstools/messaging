import type { IClientPublishOptions } from 'mqtt';
import type { MqttQoS } from '../channel/mqtt.channel-config.js';

export interface MqttV5Properties extends NonNullable<
  IClientPublishOptions['properties']
> {}

export class MqttMessageOptions {
  constructor(
    public readonly options: {
      topic?: string;
      qos?: MqttQoS;
      retain?: boolean;
      dup?: boolean;
      properties?: MqttV5Properties;
    } = {},
  ) {}
}
