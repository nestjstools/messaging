import { AmazonSqsChannel } from '../channel/amazon-sqs.channel';
import {
  ConsumerMessage,
  IMessagingConsumer,
  MessageConsumer,
  ConsumerDispatchedMessageError,
  ConsumerMessageBus,
} from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import {
  CreateQueueCommand,
  DeleteMessageCommand,
  MessageAttributeValue,
  ReceiveMessageCommand,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';

@Injectable()
@MessageConsumer(AmazonSqsChannel)
export class AmazonSqsMessagingConsumer
  implements IMessagingConsumer<AmazonSqsChannel> {
  private channel?: AmazonSqsChannel = undefined;

  async consume(
    dispatcher: ConsumerMessageBus,
    channel: AmazonSqsChannel,
  ): Promise<void> {
    this.channel = channel;
    const client = this.channel.client;

    async function processPollMessages() {
      const delay = (s: number) =>
        new Promise((resolve) => setTimeout(resolve, s * 1000));
      while (true) {
        const receiveParams = {
          QueueUrl: channel.config.queueUrl,
          MaxNumberOfMessages: channel.config.maxNumberOfMessages,
          WaitTimeSeconds: channel.config.waitTimeSeconds,
          VisibilityTimeout: channel.config.visibilityTimeout,
          MessageAttributeNames: ['All'],
        };

        const response = await client.send(
          new ReceiveMessageCommand(receiveParams),
        );

        if (response.Messages && response.Messages.length > 0) {
          for (const message of response.Messages) {
            const attrs = message.MessageAttributes as Record<
              string,
              MessageAttributeValue
            >;
            const messageBody = message.Body as string;
            const routingKey = attrs.messagingRoutingKey.StringValue as string;
            await dispatcher.dispatch(
              new ConsumerMessage(JSON.parse(messageBody), routingKey),
            );
            const deleteParams = {
              QueueUrl: channel.config.queueUrl,
              ReceiptHandle: message.ReceiptHandle,
            };
            await client.send(new DeleteMessageCommand(deleteParams));
          }
        }
        await delay(channel.config.waitTimeSeconds as number);
      }
    }

    await this.createDeadLetterQueue(channel);

    processPollMessages();

    return Promise.resolve();
  }

  async onError(
    errored: ConsumerDispatchedMessageError,
    channel: AmazonSqsChannel,
  ): Promise<void> {
    if (!channel.config.deadLetterQueue) {
      return Promise.resolve();
    }

    const command = new SendMessageCommand({
      QueueUrl: `${channel.config.queueUrl}_dead_letter`,
      MessageBody: JSON.stringify(errored.dispatchedConsumerMessage.message),
      MessageAttributes: {
        messagingRoutingKey: {
          DataType: 'String',
          StringValue: errored.dispatchedConsumerMessage.routingKey,
        },
      },
    });

    await channel.client.send(command);

    return Promise.resolve();
  }

  private createDeadLetterQueue(channel: AmazonSqsChannel): Promise<void> {
    if (!channel.config.deadLetterQueue) {
      return Promise.resolve();
    }

    channel.client.send(
      new CreateQueueCommand({
        QueueName: `${channel.config.queueName}_dead_letter`,
      }),
    );

    return Promise.resolve();
  }
}
