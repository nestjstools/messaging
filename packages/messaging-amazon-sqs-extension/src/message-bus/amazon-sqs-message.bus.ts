import { RoutingMessage } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { AmazonSqsChannel } from '../channel/amazon-sqs.channel';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { AmazonSqsMessageOptions } from '../message/amazon-sqs-message-options';
import { MessageAttributeValue } from '@aws-sdk/client-sqs/dist-types/models/models_0';

@Injectable()
export class AmazonSqsMessageBus implements IMessageBus {
  constructor(private readonly channel: AmazonSqsChannel) {}

  async dispatch(message: RoutingMessage): Promise<object | void> {
    const messageOptions = message.messageOptions;
    let attributes: Record<string, MessageAttributeValue> = {};

    if (
      messageOptions !== undefined &&
      !(messageOptions instanceof AmazonSqsMessageOptions)
    ) {
      throw new Error(
        `Message options must be a ${AmazonSqsMessageOptions.name} object`,
      );
    }

    if (messageOptions instanceof AmazonSqsMessageOptions) {
      attributes = messageOptions.attributes;
    }

    attributes.messagingRoutingKey = {
      DataType: 'String',
      StringValue: message.messageRoutingKey,
    };

    const command = new SendMessageCommand({
      QueueUrl: this.channel.config.queueUrl,
      MessageBody: JSON.stringify(message.message),
      MessageAttributes: attributes,
    });

    await this.channel.client.send(command);
  }
}
