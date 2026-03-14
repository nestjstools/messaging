import {
  ConsumerDispatchedMessageError,
  ConsumerMessage,
  ConsumerMessageBus,
  IMessagingConsumer,
  MessageConsumer,
} from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { NatsJetStreamChannel } from '../channel/nats-jet-stream.channel';
import {
  AckPolicy,
  DeliverPolicy,
  RetentionPolicy,
  StorageType as NatsStorageType,
} from 'nats/lib/jetstream/jsapi_types';
import { StorageType } from '../channel/nats-jet-stream-channel.config';

@Injectable()
@MessageConsumer(NatsJetStreamChannel)
export class NatsJetStreamMessagingConsumer
  implements IMessagingConsumer<NatsJetStreamChannel> {
  private channel?: NatsJetStreamChannel = undefined;

  async consume(
    dispatcher: ConsumerMessageBus,
    channel: NatsJetStreamChannel,
  ): Promise<void> {
    this.channel = channel;
    const jsm = await channel.jetStreamManager();
    const js = await channel.jetStreamClient();

    // Create stream if it doesn't exist
    try {
      await jsm.streams.info(channel.config.streamConfig.streamName);
      // Stream exists — optionally update it
      if (channel.config.streamConfig.autoUpdate) {
        await jsm.streams.update(channel.config.streamConfig.streamName, {
          subjects: channel.config.streamConfig.deliverSubjects,
          max_msgs: channel.config.streamConfig.maxMsgs,
          max_bytes: channel.config.streamConfig.maxBytes,
        });
      }
    } catch (err) {
      if (err.code === '404') {
        // Stream does not exist — safe to create
        await jsm.streams.add({
          name: channel.config.streamConfig.streamName,
          subjects: channel.config.streamConfig.deliverSubjects,
          max_msgs: channel.config.streamConfig.maxMsgs,
          max_bytes: channel.config.streamConfig.maxBytes,
          retention: RetentionPolicy.Interest,
          storage:
            channel.config.streamConfig.storageType === StorageType.Memory
              ? NatsStorageType.Memory
              : NatsStorageType.File,
        });
      } else {
        throw err; // Unexpected error — rethrow
      }
    }

    // Create consumer if does not exists
    try {
      await jsm.consumers.add(channel.config.streamConfig.streamName, {
        durable_name: channel.config.consumerConfig.durableName,
        filter_subject: channel.config.consumerConfig.subject,
        ack_policy: AckPolicy.None,
        deliver_policy: DeliverPolicy.New,
      });
    } catch (e) {
      if (
        channel.config.consumerConfig.autoUpdate &&
        channel.config.consumerConfig.durableName
      ) {
        await jsm.consumers.update(
          channel.config.streamConfig.streamName,
          channel.config.consumerConfig.durableName,
          {
            filter_subject: channel.config.consumerConfig.subject,
          },
        );
      }
    }

    // Bind to that durable consumer
    const consumer = await js.consumers.get(
      channel.config.streamConfig.streamName,
      channel.config.consumerConfig.durableName,
    );
    const messages = await consumer.consume();

    async function consumeMessages() {
      for await (const msg of messages) {
        const headers = msg.headers ?? undefined;
        const deserialized = msg.json() as object;
        await dispatcher.dispatch(
          new ConsumerMessage(
            deserialized,
            headers?.get('messaging-routing-key') ?? msg.subject,
          ),
        );
      }
    }

    consumeMessages();

    return Promise.resolve();
  }

  async onError(
    errored: ConsumerDispatchedMessageError,
    channel: NatsJetStreamChannel,
  ): Promise<void> {
    return Promise.resolve();
  }
}
