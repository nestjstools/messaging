import { Channel } from '@nestjstools/messaging';
import {
  AzureServiceBusChannelConfig,
  Mode,
} from './azure-service-bus-channel.config';
import {
  ServiceBusAdministrationClient,
  ServiceBusClient,
} from '@azure/service-bus';

export class AzureServiceBusChannel extends Channel<AzureServiceBusChannelConfig> {
  public readonly client: ServiceBusClient;
  public readonly adminClient?: ServiceBusAdministrationClient = undefined;

  constructor(config: AzureServiceBusChannelConfig) {
    super(config);
    this.client = new ServiceBusClient(config.connectionString);

    if (config.autoCreate) {
      this.adminClient = new ServiceBusAdministrationClient(
        config.connectionString,
      );
    }

    if (Mode.QUEUE === config.mode && !config.queue) {
      throw new Error(
        'For [Mode.QUEUE] property `queue` in config must be defined',
      );
    }

    if (Mode.TOPIC === config.mode && (!config.topic || !config.subscription)) {
      throw new Error(
        'For [Mode.TOPIC] properties `topic` and `subscription` in config must be defined',
      );
    }
  }

  isQueueMode(): boolean {
    return Mode.QUEUE === this.config.mode;
  }

  isTopicMode(): boolean {
    return Mode.TOPIC === this.config.mode;
  }

  getQueue(): string {
    if (!this.config.queue) {
      throw new Error('[queue] in config is not defined');
    }
    return this.config.queue;
  }

  getTopic(): string {
    if (!this.config.topic) {
      throw new Error('[topic] in config is not defined');
    }
    return this.config.topic;
  }

  getSubscription(): string {
    if (!this.config.subscription) {
      throw new Error('[subscription] in config is not defined');
    }
    return this.config.subscription;
  }

  async onChannelDestroy(): Promise<void> {
    await this.client.close();
    return super.onChannelDestroy();
  }
}
