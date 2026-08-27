import { ChannelConfig } from '@nestjstools/messaging';

export type MqttQoS = 0 | 1 | 2;

export interface MqttSubscription {
  topicFilter: string;
  qos?: MqttQoS;
  /** Fixed handler routing key for a wildcard subscription. */
  routingKey?: string;
}

export interface MqttChannelConfigOptions {
  name: string;
  brokerUrl: string;
  clientId?: string;
  username?: string;
  password?: string | Buffer;
  protocolVersion?: 3 | 4 | 5;
  clean?: boolean;
  keepalive?: number;
  reconnectPeriod?: number;
  sessionExpiryInterval?: number;
  subscriptions?: MqttSubscription[];
  defaultQos?: MqttQoS;
  rejectUnauthorized?: boolean;
  ca?: string | string[] | Buffer | Buffer[];
  cert?: string | string[] | Buffer | Buffer[];
  key?: string | string[] | Buffer | Buffer[];
  enableConsumer?: boolean;
  avoidErrorsForNotExistedHandlers?: boolean;
  middlewares?: object[];
  normalizer?: object;
}

export class MqttChannelConfig extends ChannelConfig {
  public readonly brokerUrl: string;
  public readonly clientId?: string;
  public readonly username?: string;
  public readonly password?: string | Buffer;
  public readonly protocolVersion: 3 | 4 | 5;
  public readonly clean: boolean;
  public readonly keepalive: number;
  public readonly reconnectPeriod: number;
  public readonly sessionExpiryInterval?: number;
  public readonly subscriptions: MqttSubscription[];
  public readonly defaultQos: MqttQoS;
  public readonly rejectUnauthorized?: boolean;
  public readonly ca?: string | string[] | Buffer | Buffer[];
  public readonly cert?: string | string[] | Buffer | Buffer[];
  public readonly key?: string | string[] | Buffer | Buffer[];

  constructor(options: MqttChannelConfigOptions) {
    const config = resolveConfig(options);

    super(
      config.name,
      config.avoidErrorsForNotExistedHandlers,
      config.middlewares,
      config.enableConsumer,
      config.normalizer,
    );
    Object.assign(this, config);
  }
}

function resolveConfig(options: MqttChannelConfigOptions) {
  validateOptions(options);

  return {
    ...options,
    protocolVersion: options.protocolVersion ?? 4,
    clean: options.clean ?? true,
    keepalive: options.keepalive ?? 60,
    reconnectPeriod: options.reconnectPeriod ?? 1000,
    subscriptions: options.subscriptions ?? [],
    defaultQos: options.defaultQos ?? 0,
  };
}

function validateOptions(options: MqttChannelConfigOptions): void {
  requireText(options.name, 'MQTT channel name is required');

  if (!/^mqtts?:\/\/|^wss?:\/\//.test(options.brokerUrl ?? '')) {
    throw new Error('MQTT brokerUrl must use mqtt, mqtts, ws, or wss');
  }

  if (
    options.protocolVersion !== undefined &&
    ![3, 4, 5].includes(options.protocolVersion)
  ) {
    throw new Error('MQTT protocolVersion must be 3, 4, or 5');
  }
  validateQos(options.defaultQos, 'MQTT defaultQos');
  validateNonNegativeInteger(options.keepalive, 'MQTT keepalive');
  validateNonNegativeInteger(options.reconnectPeriod, 'MQTT reconnectPeriod');

  for (const subscription of options.subscriptions ?? []) {
    requireText(
      subscription.topicFilter,
      'MQTT subscription topicFilter is required',
    );
    validateQos(subscription.qos, 'MQTT subscription qos');
    if (subscription.routingKey !== undefined) {
      requireText(
        subscription.routingKey,
        'MQTT subscription routingKey cannot be empty',
      );
    }
  }
}

function requireText(value: string | undefined, message: string): void {
  if (!value?.trim()) throw new Error(message);
}

function validateQos(value: number | undefined, label: string): void {
  if (value !== undefined && !isQos(value))
    throw new Error(`${label} must be 0, 1, or 2`);
}

function validateNonNegativeInteger(
  value: number | undefined,
  label: string,
): void {
  if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
    throw new Error(`${label} must be a non-negative integer`);
  }
}

function isQos(value: number): value is MqttQoS {
  return value === 0 || value === 1 || value === 2;
}
