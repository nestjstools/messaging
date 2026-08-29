import { Global, Module } from '@nestjs/common';
import { RedisChannelFactory } from './channel/redis.channel-factory.js';
import { RedisMessageBusFactory } from './message-bus/redis-message-bus-factory.js';
import { RedisMessagingConsumer } from './consumer/redis-messaging.consumer.js';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    RedisMessageBusFactory,
    RedisChannelFactory,
    RedisMessagingConsumer,
  ],
})
export class MessagingRedisExtensionModule {}
