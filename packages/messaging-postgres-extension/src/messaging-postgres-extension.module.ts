import { Global, Module } from '@nestjs/common';
import { PostgresChannelFactory } from './channel/postgres.channel-factory';
import { PostgresMessagingConsumer } from './consumer/postgres-messaging.consumer';
import { PostgresMessageBusFactory } from './message-bus/postgres-message-bus-factory';

@Global()
@Module({
  providers: [
    PostgresChannelFactory,
    PostgresMessageBusFactory,
    PostgresMessagingConsumer,
  ],
})
export class MessagingPostgresExtensionModule {}
