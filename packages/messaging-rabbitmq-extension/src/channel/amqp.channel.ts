import { Channel } from '@nestjstools/messaging';
import { RmqChannelConfig as ExtensionAmqpChannelConfig } from './rmq-channel.config.js';
import {
  AmqpConnectionManager,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';

export class AmqpChannel extends Channel<ExtensionAmqpChannelConfig> {
  public connection: AmqpConnectionManager;

  constructor(config: ExtensionAmqpChannelConfig) {
    super(config);
    this.connection = connect(this.config.connectionUri, {
      reconnectTimeInSeconds: 5,
      heartbeatIntervalInSeconds: 30,
    });
  }

  createChannelWrapper(): ChannelWrapper {
    return this.connection.createChannel();
  }

  async onChannelDestroy(): Promise<void> {
    if (!this.connection) return;
    await this.connection.close();
    this.connection = undefined;
  }
}
