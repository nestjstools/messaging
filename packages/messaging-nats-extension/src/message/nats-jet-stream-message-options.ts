import type { JetStreamPublishOptions } from '@nats-io/jetstream';
import { NatsMessageOptions } from './nats-message-options.js';

export interface NatsJetStreamMessageOptionsProps extends Pick<
  Partial<JetStreamPublishOptions>,
  'retries' | 'schedule' | 'timeout' | 'ttl'
> {
  headers?: Record<string, string>;
}

export class NatsJetStreamMessageOptions extends NatsMessageOptions {
  public readonly ttl?: string;
  public readonly retries?: number;
  public readonly schedule?: JetStreamPublishOptions['schedule'];
  public readonly timeout?: number;

  constructor(props: NatsJetStreamMessageOptionsProps = {}) {
    super(props.headers);
    this.ttl = props.ttl;
    this.retries = props.retries;
    this.schedule = props.schedule;
    this.timeout = props.timeout;
  }
}
