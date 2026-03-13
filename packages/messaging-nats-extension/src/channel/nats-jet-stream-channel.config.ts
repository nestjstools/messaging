import { ChannelConfig } from '@nestjstools/messaging';

export class NatsJetStreamChannelConfig extends ChannelConfig {
  public readonly connectionUris: string[] | string;
  public readonly streamConfig: StreamConfig;
  public readonly consumerConfig: ConsumerConfig;

  constructor({
    connectionUris,
    name,
    enableConsumer,
    avoidErrorsForNotExistedHandlers,
    middlewares,
    normalizer,
    streamConfig,
    consumerConfig,
  }: NatsJetStreamChannelConfig) {
    super(
      name,
      avoidErrorsForNotExistedHandlers,
      middlewares,
      enableConsumer,
      normalizer,
    );
    this.connectionUris =
      typeof connectionUris === 'string' ? [connectionUris] : connectionUris;
    this.streamConfig = {
      autoUpdate: streamConfig.autoUpdate ?? false,
      maxBytes: streamConfig.maxBytes ?? 1000,
      maxMsgs: streamConfig.maxMsgs ?? 10_000_000,
      streamName: streamConfig.streamName,
      deliverSubjects: streamConfig.deliverSubjects,
      storageType: streamConfig.storageType ?? StorageType.Memory,
    };
    this.consumerConfig = {
      autoUpdate: streamConfig.autoUpdate ?? false,
      durableName: consumerConfig.durableName,
      subject: consumerConfig.subject,
    };
  }
}

export enum StorageType {
  /**
   * Store persistently on files
   */
  File = 'file',
  /**
   * Store in server memory - doesn't survive server restarts
   */
  Memory = 'memory',
}

export interface StreamConfig {
  autoUpdate?: boolean;
  streamName: string;
  deliverSubjects: string[];
  maxMsgs?: number;
  maxBytes?: number;
  storageType?: StorageType;
}

export interface ConsumerConfig {
  autoUpdate?: boolean;
  durableName?: string;
  subject: string;
}
