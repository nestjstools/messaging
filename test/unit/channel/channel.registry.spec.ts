import { ChannelRegistry } from '../../../src/channel/channel.registry';
import { IMessagingLogger } from '../../../src/logger/i-messaging-logger';
import { Channel } from '../../../src';
import { MessagingException } from '../../../src/exception/messaging.exception';
import { Logger } from '@nestjs/common';

describe('ChannelRegistry', () => {
  let registry: ChannelRegistry;
  let mockLogger: IMessagingLogger;
  let mockChannel: Channel<any>;

  beforeEach(() => {
    mockLogger = { log: jest.fn() } as unknown as Logger;
    mockChannel = {
      config: { name: 'testChannel' },
    } as unknown as Channel<any>;
    registry = new ChannelRegistry([mockChannel], mockLogger);
  });

  test('should register a channel on instantiation', () => {
    expect(registry.getByName('testChannel')).toBe(mockChannel);
    expect(mockLogger.log).toHaveBeenCalledWith(
      'Channel [testChannel] was registered',
    );
  });

  test('should not register the same channel twice', () => {
    registry.register(mockChannel);
    expect(registry.getAll().length).toBe(1);
  });

  test('should throw an exception if no channel is found by name', () => {
    expect(() => registry.getByName('unknownChannel')).toThrow(
      MessagingException,
    );
  });

  test('should retrieve all registered channels', () => {
    const anotherMockChannel = {
      config: { name: 'anotherChannel' },
    } as unknown as Channel<any>;
    registry.register(anotherMockChannel);
    expect(registry.getAll()).toEqual([mockChannel, anotherMockChannel]);
  });
});
