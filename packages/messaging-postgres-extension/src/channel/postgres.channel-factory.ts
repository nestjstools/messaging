import { Injectable } from '@nestjs/common';
import { ChannelFactory, IChannelFactory } from '@nestjstools/messaging';
import { PostgresChannel } from './postgres.channel';
import { PostgresChannelConfig } from './postgres.channel-config';

@Injectable()
@ChannelFactory(PostgresChannelConfig)
export class PostgresChannelFactory implements IChannelFactory<PostgresChannelConfig> {
  create(channelConfig: PostgresChannelConfig): PostgresChannel {
    return new PostgresChannel(channelConfig);
  }
}
