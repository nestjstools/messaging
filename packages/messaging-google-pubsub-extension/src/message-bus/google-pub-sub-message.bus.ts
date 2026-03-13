import { RoutingMessage } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { GooglePubSubChannel } from '../channel/google-pub-sub.channel';
import { Buffer } from 'buffer';
import { ROUTING_KEY_ATTRIBUTE_NAME } from '../const';
import { GooglePubSubMessageOptions } from '../message/google-pub-sub-message-options';

@Injectable()
export class GooglePubSubMessageBus implements IMessageBus {
  constructor(private readonly channel: GooglePubSubChannel) {}

  async dispatch(message: RoutingMessage): Promise<object | void> {
    const messageOptions = message.messageOptions;

    if (
      messageOptions !== undefined &&
      !(messageOptions instanceof GooglePubSubMessageOptions)
    ) {
      throw new Error(
        `Message options must be a ${GooglePubSubMessageOptions.name} object`,
      );
    }

    const topic = this.channel.pubSubManager.topic(
      this.channel.config.topicName,
    );
    const serializedMessage = JSON.stringify(message.message);
    const data = Buffer.from(serializedMessage);

    if (messageOptions instanceof GooglePubSubMessageOptions) {
      const attributes = {
        [ROUTING_KEY_ATTRIBUTE_NAME]: message.messageRoutingKey,
        ...messageOptions.attributes,
      };
      await topic.publishMessage({ data, attributes });
      return;
    }

    await topic.publishMessage({
      data,
      attributes: { [ROUTING_KEY_ATTRIBUTE_NAME]: message.messageRoutingKey },
    });
  }
}
