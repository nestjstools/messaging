import { AmqpChannel } from '../channel/amqp.channel';
import { RABBITMQ_HEADER_ROUTING_KEY } from '../const';
import { Injectable } from '@nestjs/common';
import { ConsumerDispatchedMessageError } from '@nestjstools/messaging';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Options } from 'amqplib';

@Injectable()
export class MessageDeadLetterVisitor {
  async sendToDeadLetter(
    errored: ConsumerDispatchedMessageError,
    channel: AmqpChannel,
    amqpChannel: ChannelWrapper,
  ): Promise<void> {
    const exchange = 'dead_letter.exchange';
    const routingKey = `${channel.config.queue}_dead_letter`;

    await amqpChannel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(errored.dispatchedConsumerMessage.message)),
      {
        headers: {
          [RABBITMQ_HEADER_ROUTING_KEY]:
            errored.dispatchedConsumerMessage.routingKey,
        },
      } as Options.Publish,
    );
  }
}
