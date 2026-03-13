import { Global, Module } from '@nestjs/common';
import { RedisChannelFactory } from './channel/redis.channel-factory';
import { RedisMessageBusFactory } from './message-bus/redis-message-bus-factory';
import { RedisMessagingConsumer } from './consumer/redis-messaging.consumer';

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
