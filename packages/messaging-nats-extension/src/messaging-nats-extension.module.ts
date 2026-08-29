import { Global, Module } from '@nestjs/common';
import { NatsMessageBusFactory } from './message-bus/nats-message-bus-factory.js';
import { NatsChannelFactory } from './channel/nats-channel-factory.js';
import { NatsMessagingConsumer } from './consumer/nats-messaging-consumer.js';
import { NatsJetStreamChannelFactory } from './channel/nats-jet-stream-channel-factory.js';
import { NatsJetStreamMessagingConsumer } from './consumer/nats-jet-stream-messaging-consumer.js';
import { NatsJetStreamMessageBusFactory } from './message-bus/nats-jet-stream-message-bus-factory.js';

@Global()
@Module({
  providers: [
    NatsMessageBusFactory,
    NatsChannelFactory,
    NatsMessagingConsumer,
    NatsJetStreamChannelFactory,
    NatsJetStreamMessagingConsumer,
    NatsJetStreamMessageBusFactory,
  ],
})
export class MessagingNatsExtensionModule {}
