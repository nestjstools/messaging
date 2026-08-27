import { Injectable } from '@nestjs/common';
import {
  IMessageBus,
  IMessageBusFactory,
  MessageBusFactory,
} from '@nestjstools/messaging';
import { PostgresChannel } from '../channel/postgres.channel';
import { PostgresMessageBus } from './postgres-message.bus';

@Injectable()
@MessageBusFactory(PostgresChannel)
export class PostgresMessageBusFactory implements IMessageBusFactory<PostgresChannel> {
  create(channel: PostgresChannel): IMessageBus {
    return new PostgresMessageBus(channel);
  }
}
