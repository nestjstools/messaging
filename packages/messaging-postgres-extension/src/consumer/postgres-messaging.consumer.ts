import { Injectable } from '@nestjs/common';
import {
  ConsumerDispatchedMessageError,
  ConsumerMessage,
  ConsumerMessageBus,
  IMessagingConsumer,
  MessageConsumer,
} from '@nestjstools/messaging';
import { PostgresChannel } from '../channel/postgres.channel';
import { PostgresMessageEnvelope } from '../message/postgres-message-envelope';

const POSTGRES_DISPATCH_ERROR = 'POSTGRES_DISPATCH_ERROR';

@Injectable()
@MessageConsumer(PostgresChannel)
export class PostgresMessagingConsumer implements IMessagingConsumer<PostgresChannel> {
  async consume(
    dispatcher: ConsumerMessageBus,
    channel: PostgresChannel,
  ): Promise<void> {
    await channel.start();

    await Promise.all(
      Array.from({ length: channel.config.workerConcurrency }, () =>
        channel.boss.work(channel.config.queue, async (jobs) => {
          for (const job of jobs) {
            const envelope = job.data as PostgresMessageEnvelope;
            const metadata: Record<string, unknown> = {};

            await dispatcher.dispatch(
              new ConsumerMessage(
                envelope.payload,
                envelope.routingKey,
                metadata,
              ),
            );

            const dispatchError = metadata[POSTGRES_DISPATCH_ERROR];
            if (dispatchError instanceof Error) {
              throw dispatchError;
            }
          }
        }),
      ),
    );
  }

  async onError(
    errored: ConsumerDispatchedMessageError,
    channel: PostgresChannel,
  ): Promise<void> {
    void channel;
    errored.dispatchedConsumerMessage.metadata[POSTGRES_DISPATCH_ERROR] =
      errored.error;
  }
}
