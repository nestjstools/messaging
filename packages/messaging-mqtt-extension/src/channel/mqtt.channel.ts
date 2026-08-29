import { Channel } from '@nestjstools/messaging';
import { connect, type IClientOptions, type MqttClient } from 'mqtt';
import { MqttChannelConfig } from './mqtt.channel-config.js';

export class MqttChannel extends Channel<MqttChannelConfig> {
  private client?: MqttClient;
  private starting?: Promise<MqttClient>;

  async start(): Promise<MqttClient> {
    if (this.client?.connected) return this.client;
    if (this.starting) return this.starting;
    if (!this.client) {
      const config = this.config;
      const options: IClientOptions = {
        clientId: config.clientId,
        username: config.username,
        password: config.password,
        protocolVersion: config.protocolVersion,
        clean: config.clean,
        keepalive: config.keepalive,
        reconnectPeriod: config.reconnectPeriod,
        rejectUnauthorized: config.rejectUnauthorized,
        ca: config.ca,
        cert: config.cert,
        key: config.key,
        properties:
          config.protocolVersion === 5 &&
          config.sessionExpiryInterval !== undefined
            ? { sessionExpiryInterval: config.sessionExpiryInterval }
            : undefined,
      };
      this.client = connect(config.brokerUrl, options);
    }
    this.starting = new Promise<MqttClient>((resolve, reject) => {
      const onConnect = () => {
        cleanup();
        resolve(this.client!);
      };
      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };
      const cleanup = () => {
        this.client?.removeListener('connect', onConnect);
        this.client?.removeListener('error', onError);
        this.starting = undefined;
      };
      this.client!.once('connect', onConnect);
      this.client!.once('error', onError);
    });
    return this.starting;
  }

  async onChannelDestroy(): Promise<void> {
    if (this.client)
      await new Promise<void>((resolve, reject) =>
        this.client!.end(false, {}, (error) =>
          error ? reject(error) : resolve(),
        ),
      );
    this.client = undefined;
    await super.onChannelDestroy();
  }
}
