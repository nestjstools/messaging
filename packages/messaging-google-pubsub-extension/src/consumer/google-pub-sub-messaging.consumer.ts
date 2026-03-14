import { GooglePubSubChannel } from '../channel/google-pub-sub.channel';
import {
  ConsumerMessage,
  IMessagingConsumer,
  MessageConsumer,
  ConsumerDispatchedMessageError,
  ConsumerMessageBus,
} from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { ROUTING_KEY_ATTRIBUTE_NAME } from '../const';

@Injectable()
@MessageConsumer(GooglePubSubChannel)
export class GooglePubSubMessagingConsumer
  implements IMessagingConsumer<GooglePubSubChannel> {
  private channel: GooglePubSubChannel;

  async consume(
    dispatcher: ConsumerMessageBus,
    channel: GooglePubSubChannel,
  ): Promise<void> {
    this.channel = channel;
    const manager = this.channel.pubSubManager;

    const [topics] = await manager.getTopics();
    const topicExists = topics.some((t) =>
      t.name.endsWith(channel.config.topicName),
    );

    if (!topicExists && channel.config.autoCreate) {
      await manager.createTopic(channel.config.topicName);
    }

    const topic = manager.topic(channel.config.topicName);

    const [subscriptions] = await topic.getSubscriptions();
    const subscriptionExists = subscriptions.some((sub) =>
      sub.name.endsWith(channel.config.subscriptionName),
    );

    if (!subscriptionExists && channel.config.autoCreate) {
      await topic.createSubscription(channel.config.subscriptionName);
    }

    manager
      .subscription(this.channel.config.subscriptionName)
      .on('message', async (message) => {
        await dispatcher.dispatch(
          new ConsumerMessage(
            JSON.parse(message.data.toString()),
            message.attributes[ROUTING_KEY_ATTRIBUTE_NAME],
          ),
        );
        message.ack();
      });

    return Promise.resolve();
  }

  async onError(
    errored: ConsumerDispatchedMessageError,
    channel: GooglePubSubChannel,
  ): Promise<void> {
    return Promise.resolve();
  }
}
