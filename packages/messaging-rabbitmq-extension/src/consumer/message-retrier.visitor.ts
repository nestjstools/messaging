import { AmqpChannel } from '../channel/amqp.channel';
import {
  RABBITMQ_HEADER_RETRY_COUNT,
  RABBITMQ_HEADER_ROUTING_KEY,
} from '../const';
import { Injectable } from '@nestjs/common';
import { ConsumerDispatchedMessageError } from '@nestjstools/messaging';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Options } from 'amqplib';
import { ExchangeType } from '../channel/rmq-channel.config';

@Injectable()
export class MessageRetrierVisitor {
  async retryMessage(
    errored: ConsumerDispatchedMessageError,
    channel: AmqpChannel,
    amqpChannel: ChannelWrapper,
    currentRetryCount: number,
  ): Promise<void> {
    const message = errored.dispatchedConsumerMessage;
    const routingKey =
      ExchangeType.DIRECT === channel.config.exchangeType
        ? (channel.config.bindingKeys[0] ?? message.routingKey)
        : message.routingKey;
    const newRetryCount = currentRetryCount + 1;
    await amqpChannel.publish(
      `${channel.config.exchangeName}_retry.exchange`,
      routingKey,
      Buffer.from(JSON.stringify(message.message)),
      {
        headers: {
          [RABBITMQ_HEADER_RETRY_COUNT]: newRetryCount,
          [RABBITMQ_HEADER_ROUTING_KEY]: message.routingKey,
        },
      } as Options.Publish,
    );

    return Promise.resolve();
  }
}
