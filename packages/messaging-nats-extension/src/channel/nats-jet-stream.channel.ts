import { Channel } from '@nestjstools/messaging';
import { NatsConnection } from '@nats-io/nats-core';
import {
  jetstream,
  jetstreamManager,
  JetStreamClient,
  JetStreamManager,
} from '@nats-io/jetstream';
import { connect } from '@nats-io/transport-node';
import { NatsJetStreamChannelConfig } from './nats-jet-stream-channel.config.js';

export class NatsJetStreamChannel extends Channel<NatsJetStreamChannelConfig> {
  public readonly client: Promise<NatsConnection>;

  constructor(config: NatsJetStreamChannelConfig) {
    super(config);
    this.client = connect({ servers: config.connectionUris });
  }

  async jetStreamClient(): Promise<JetStreamClient> {
    const client = await this.client;
    return jetstream(client);
  }

  async jetStreamManager(): Promise<JetStreamManager> {
    const client = await this.client;
    return jetstreamManager(client);
  }

  async onChannelDestroy(): Promise<void> {
    const client = await this.client;
    await client.drain();
    await client.close();
    return super.onChannelDestroy();
  }
}
