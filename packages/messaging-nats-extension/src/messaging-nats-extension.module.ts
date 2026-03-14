import { Global, Module } from '@nestjs/common';
import { NatsMessageBusFactory } from './message-bus/nats-message-bus-factory';
import { NatsChannelFactory } from './channel/nats-channel-factory';
import { NatsMessagingConsumer } from './consumer/nats-messaging-consumer';
import { NatsJetStreamChannelFactory } from './channel/nats-jet-stream-channel-factory';
import { NatsJetStreamMessagingConsumer } from './consumer/nats-jet-stream-messaging-consumer';
import { NatsJetStreamMessageBusFactory } from './message-bus/nats-jet-stream-message-bus-factory';

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
