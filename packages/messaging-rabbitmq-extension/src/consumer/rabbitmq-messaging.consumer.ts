import { AmqpChannel } from '../channel/amqp.channel';
import {
  RABBITMQ_HEADER_RETRY_COUNT,
  RABBITMQ_HEADER_ROUTING_KEY,
} from '../const';
import { ConsumerMessageBus, IMessagingConsumer } from '@nestjstools/messaging';
import { ConsumerMessage } from '@nestjstools/messaging';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { MessageConsumer } from '@nestjstools/messaging';
import { ConsumerDispatchedMessageError } from '@nestjstools/messaging';
import { RabbitmqMigrator } from '../migrator/rabbitmq.migrator';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel, ConsumeMessage } from 'amqplib';
import { MessageRetrierVisitor } from './message-retrier.visitor';
import { MessageDeadLetterVisitor } from './message-dead-letter.visitor';

@Injectable()
@MessageConsumer(AmqpChannel)
export class RabbitmqMessagingConsumer
  implements IMessagingConsumer<AmqpChannel>, OnModuleDestroy
{
  private readonly channelWrappers = new WeakMap<AmqpChannel, ChannelWrapper>();
  private readonly channels = new Set<AmqpChannel>();

  constructor(
    private readonly rabbitMqMigrator: RabbitmqMigrator,
    private readonly messageRetrier: MessageRetrierVisitor,
    private readonly messageDeadLetter: MessageDeadLetterVisitor,
  ) {}

  async consume(
    dispatcher: ConsumerMessageBus,
    channel: AmqpChannel,
  ): Promise<void> {
    this.channels.add(channel);
    await this.rabbitMqMigrator.run(channel);

    if (!channel.connection) {
      throw new Error(
        'There is no active connection to RabbitMQ. Cannot consume messages.',
      );
    }

    const channelWrapper = channel.createChannelWrapper();
    await channelWrapper.waitForConnect();
    this.channelWrappers.set(channel, channelWrapper);

    await channelWrapper.addSetup(async (rawChannel: Channel) => {
      await rawChannel.prefetch(channel.config.qos, false);
      return rawChannel.consume(
        channel.config.queue,
        async (msg: ConsumeMessage | null) => {
          if (!msg) return;

          let payload: unknown = msg.content;
          if (Buffer.isBuffer(payload)) {
            try {
              payload = JSON.parse(payload.toString());
            } catch {
              rawChannel.nack(msg, false, false);
              return;
            }
          }

          const retryCount =
            (msg.properties.headers?.[RABBITMQ_HEADER_RETRY_COUNT] as
              | number
              | undefined) ?? 0;

          const routingKey: string =
            (msg.properties.headers?.[RABBITMQ_HEADER_ROUTING_KEY] as
              | string
              | undefined) ?? msg.fields.routingKey;

          await dispatcher.dispatch(
            new ConsumerMessage(payload as object, routingKey, {
              [RABBITMQ_HEADER_RETRY_COUNT]: retryCount,
            }),
          );

          rawChannel.ack(msg);
        },
        { noAck: false },
      );
    });
  }

  async onError(
    errored: ConsumerDispatchedMessageError,
    channel: AmqpChannel,
  ): Promise<void> {
    const channelWrapper = this.channelWrappers.get(channel);

    if (!channelWrapper) {
      return;
    }

    if (channel.config.retryMessage) {
      const limit = channel.config.retryMessage;
      const currentRetryCount =
        errored.dispatchedConsumerMessage.metadata[
          RABBITMQ_HEADER_RETRY_COUNT
        ] ?? 0;

      if (currentRetryCount < limit) {
        return this.messageRetrier.retryMessage(
          errored,
          channel,
          channelWrapper,
          currentRetryCount,
        );
      }
    }

    if (channel.config.deadLetterQueueFeature) {
      return this.messageDeadLetter.sendToDeadLetter(
        errored,
        channel,
        channelWrapper,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    for (const channel of this.channels) {
      if (channel.connection) {
        await channel.connection.close();
      }
    }
    this.channels.clear();
  }
}
