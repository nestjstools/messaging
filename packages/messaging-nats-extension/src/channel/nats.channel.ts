import { Channel } from '@nestjstools/messaging';
import { NatsChannelConfig } from './nats-channel.config';
import { NatsConnection } from '@nats-io/nats-core';
import { connect } from '@nats-io/transport-node';

export class NatsChannel extends Channel<NatsChannelConfig> {
  public readonly client: Promise<NatsConnection>;

  constructor(config: NatsChannelConfig) {
    super(config);
    this.client = connect({ servers: config.connectionUris });
  }

  async onChannelDestroy(): Promise<void> {
    const client = await this.client;
    await client.drain();
    await client.close();
    return super.onChannelDestroy();
  }
}
