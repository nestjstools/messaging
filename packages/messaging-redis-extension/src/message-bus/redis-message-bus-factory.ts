import { Injectable } from '@nestjs/common';
import { RedisMessageBus } from './redis-message.bus';
import { RedisChannel } from '../channel/redis.channel';
import { IMessageBusFactory } from '@nestjstools/messaging';
import { MessageBusFactory } from '@nestjstools/messaging';
import { IMessageBus } from '@nestjstools/messaging';

@Injectable()
@MessageBusFactory(RedisChannel)
export class RedisMessageBusFactory
  implements IMessageBusFactory<RedisChannel>
{
  create(channel: RedisChannel): IMessageBus {
    return new RedisMessageBus(channel);
  }
}
