import { Channel } from '@nestjstools/messaging';
import {
  connect,
  JetStreamClient,
  JetStreamManager,
  NatsConnection,
} from 'nats';
import { NatsJetStreamChannelConfig } from './nats-jet-stream-channel.config';

export class NatsJetStreamChannel extends Channel<NatsJetStreamChannelConfig> {
  public readonly client: Promise<NatsConnection>;

  constructor(config: NatsJetStreamChannelConfig) {
    super(config);
    this.client = connect({ servers: config.connectionUris });
  }

  async jetStreamClient(): Promise<JetStreamClient> {
    const client = await this.client;
    return client.jetstream();
  }

  async jetStreamManager(): Promise<JetStreamManager> {
    const client = await this.client;
    return client.jetstreamManager();
  }

  async onChannelDestroy(): Promise<void> {
    const client = await this.client;
    await client.drain();
    await client.close();
    return super.onChannelDestroy();
  }
}
