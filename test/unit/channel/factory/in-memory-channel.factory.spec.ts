import {
  ChannelConfig,
  InMemoryChannelConfig,
  InMemoryChannelFactory,
  InvalidChannelConfigException,
} from '../../../../src';
import { InMemoryChannel } from '../../../../src/channel/in-memory.channel';

describe('InMemoryChannelFactory', () => {
  let factory: InMemoryChannelFactory;

  beforeEach(() => {
    factory = new InMemoryChannelFactory();
  });

  test('should create an InMemoryChannel when given a valid InMemoryChannelConfig', () => {
    const config = new InMemoryChannelConfig({
      name: 'testInMemoryChannelConfig',
    });
    const channel = factory.create(config);
    expect(channel).toBeInstanceOf(InMemoryChannel);
  });

  test('should throw an exception when given an invalid config type', () => {
    const invalidConfig = {} as ChannelConfig;
    expect(() => factory.create(invalidConfig)).toThrow(
      InvalidChannelConfigException,
    );
  });
});
