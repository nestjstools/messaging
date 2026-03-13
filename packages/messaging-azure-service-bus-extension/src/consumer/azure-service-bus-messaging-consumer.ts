import { AzureServiceBusChannel } from '../channel/azure-service-bus.channel';
import {
  ConsumerMessage,
  IMessagingConsumer,
  MessageConsumer,
  ConsumerDispatchedMessageError, ConsumerMessageBus,
} from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { ROUTING_KEY_ATTRIBUTE_NAME } from '../const';
import { ServiceBusReceiver } from '@azure/service-bus';

@Injectable()
@MessageConsumer(AzureServiceBusChannel)
export class AzureServiceBusMessagingConsumer
  implements IMessagingConsumer<AzureServiceBusChannel> {
  private channel: AzureServiceBusChannel;

  async consume(
    dispatcher: ConsumerMessageBus,
    channel: AzureServiceBusChannel,
  ): Promise<void> {
    this.channel = channel;
    await this.autoCreate();
    let receiver: ServiceBusReceiver;

    if (this.channel.isQueueMode()) {
      receiver = this.channel.client.createReceiver(this.channel.getQueue());
    } else {
      receiver = this.channel.client.createReceiver(
        this.channel.getTopic(),
        this.channel.getSubscription(),
      );
    }

    receiver.subscribe({
      processMessage: async (message) => {
        const routingKey =
          message.applicationProperties?.[ROUTING_KEY_ATTRIBUTE_NAME];

        if (!routingKey) {
          throw new Error(
            `Routing header [${ROUTING_KEY_ATTRIBUTE_NAME}] not found in message attribute`,
          );
        }

        await dispatcher.dispatch(
          new ConsumerMessage(message.body, routingKey as string),
        );
      },
      processError: async (args) => {
        console.error(
          `Error occurred with Azure service bus: ${args.error.message}`,
          args.error,
        );
      },
    });

    return Promise.resolve();
  }

  async autoCreate(): Promise<void> {
    if (
      this.channel.config.autoCreate &&
      this.channel.adminClient &&
      this.channel.isQueueMode()
    ) {
      const isExists = await this.channel.adminClient.queueExists(
        this.channel.getQueue(),
      );
      if (!isExists) {
        await this.channel.adminClient.createQueue(this.channel.getQueue());
      }
    }

    if (
      this.channel.config.autoCreate &&
      this.channel.adminClient &&
      this.channel.isTopicMode()
    ) {
      const topicExists = await this.channel.adminClient.topicExists(
        this.channel.getTopic(),
      );
      if (!topicExists) {
        await this.channel.adminClient.createTopic(this.channel.getTopic());
      }

      const subscriptionExists =
        await this.channel.adminClient.subscriptionExists(
          this.channel.getTopic(),
          this.channel.getSubscription(),
        );
      if (!subscriptionExists) {
        await this.channel.adminClient.createSubscription(
          this.channel.getTopic(),
          this.channel.getSubscription(),
        );
      }
    }
  }

  async onError(
    errored: ConsumerDispatchedMessageError,
    channel: AzureServiceBusChannel,
  ): Promise<void> {
    return Promise.resolve();
  }
}
