import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel, ConsumeMessage } from 'amqplib';
import {
  ConsumerDispatchedMessageError,
  ConsumerMessageBus,
} from '@nestjstools/messaging';
import { RabbitmqMessagingConsumer } from '../../../src/consumer/rabbitmq-messaging.consumer';
import { RabbitmqMigrator } from '../../../src/migrator/rabbitmq.migrator';
import { MessageRetrierVisitor } from '../../../src/consumer/message-retrier.visitor';
import { MessageDeadLetterVisitor } from '../../../src/consumer/message-dead-letter.visitor';
import { AmqpChannel } from '../../../src/channel/amqp.channel';
import {
  RABBITMQ_HEADER_RETRY_COUNT,
  RABBITMQ_HEADER_ROUTING_KEY,
} from '../../../src/const';

describe('RabbitmqMessagingConsumer', () => {
  let consumer: RabbitmqMessagingConsumer;
  let mockMigrator: jest.Mocked<RabbitmqMigrator>;
  let mockRetrier: jest.Mocked<MessageRetrierVisitor>;
  let mockDeadLetter: jest.Mocked<MessageDeadLetterVisitor>;

  beforeEach(() => {
    mockMigrator = {
      run: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockRetrier = {
      retryMessage: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockDeadLetter = {
      sendToDeadLetter: jest.fn().mockResolvedValue(undefined),
    } as any;

    consumer = new RabbitmqMessagingConsumer(
      mockMigrator,
      mockRetrier,
      mockDeadLetter,
    );
  });

  describe('consume', () => {
    const createChannel = (overrides?: Partial<AmqpChannel>): AmqpChannel => {
      const rawChannel = {
        consume: jest.fn(),
        prefetch: jest.fn().mockResolvedValue(undefined),
        ack: jest.fn(),
        nack: jest.fn(),
      } as unknown as jest.Mocked<Channel>;

      const wrapper = {
        waitForConnect: jest.fn().mockResolvedValue(undefined),
        addSetup: jest.fn().mockImplementation(async (setupFn) => {
          await setupFn(rawChannel);
        }),
      } as unknown as jest.Mocked<ChannelWrapper>;

      const channel = {
        config: {
          queue: 'test.queue',
          qos: 10,
          retryMessage: 3,
          deadLetterQueueFeature: true,
        },
        connection: {
          close: jest.fn().mockResolvedValue(undefined),
        },
        createChannelWrapper: jest.fn().mockReturnValue(wrapper),
        ...overrides,
      } as unknown as jest.Mocked<AmqpChannel>;

      return channel;
    };

    const createMessage = (
      payload: object,
      headers?: Record<string, unknown>,
      routingKey = 'fallback.routing',
    ): ConsumeMessage => {
      return {
        content: Buffer.from(JSON.stringify(payload)),
        properties: {
          headers: headers ?? {},
        },
        fields: {
          routingKey,
        },
      } as unknown as ConsumeMessage;
    };

    it('should throw when channel has no active connection', async () => {
      const channel = createChannel({ connection: undefined });
      const dispatcher = {
        dispatch: jest.fn(),
      } as unknown as ConsumerMessageBus;

      await expect(consumer.consume(dispatcher, channel)).rejects.toThrow(
        'There is no active connection to RabbitMQ. Cannot consume messages.',
      );

      expect(mockMigrator.run).toHaveBeenCalledWith(channel);
    });

    it('should dispatch parsed message and ack with retry metadata defaults', async () => {
      const channel = createChannel();
      const dispatcher = {
        dispatch: jest.fn().mockResolvedValue(undefined),
      } as unknown as ConsumerMessageBus;

      await consumer.consume(dispatcher, channel);

      const wrapper = channel.createChannelWrapper() as unknown as jest.Mocked<ChannelWrapper>;
      const rawChannel = {
        consume: jest.fn(),
        prefetch: jest.fn().mockResolvedValue(undefined),
        ack: jest.fn(),
        nack: jest.fn(),
      } as unknown as jest.Mocked<Channel>;
      const setupFn = (wrapper.addSetup as jest.Mock).mock.calls[0][0];
      await setupFn(rawChannel);
      expect(rawChannel.prefetch).toHaveBeenCalledWith(10);

      const consumeHandler = (rawChannel.consume as jest.Mock).mock.calls[0][1] as (
        msg: ConsumeMessage | null,
      ) => Promise<void>;
      const msg = createMessage({ hello: 'world' });

      await consumeHandler(msg);

      expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
      const dispatchedMessage = (dispatcher.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchedMessage.message).toEqual({ hello: 'world' });
      expect(dispatchedMessage.routingKey).toBe('fallback.routing');
      expect(dispatchedMessage.metadata).toEqual({
        [RABBITMQ_HEADER_RETRY_COUNT]: 0,
      });

      expect(rawChannel.ack).toHaveBeenCalledWith(msg);
      expect(rawChannel.nack).not.toHaveBeenCalled();
    });

    it('should use routing key from header and retry count from metadata', async () => {
      const channel = createChannel();
      const dispatcher = {
        dispatch: jest.fn().mockResolvedValue(undefined),
      } as unknown as ConsumerMessageBus;

      await consumer.consume(dispatcher, channel);

      const wrapper = channel.createChannelWrapper() as unknown as jest.Mocked<ChannelWrapper>;
      const rawChannel = {
        consume: jest.fn(),
        prefetch: jest.fn().mockResolvedValue(undefined),
        ack: jest.fn(),
        nack: jest.fn(),
      } as unknown as jest.Mocked<Channel>;
      const setupFn = (wrapper.addSetup as jest.Mock).mock.calls[0][0];
      await setupFn(rawChannel);

      const consumeHandler = (rawChannel.consume as jest.Mock).mock.calls[0][1] as (
        msg: ConsumeMessage | null,
      ) => Promise<void>;
      const msg = createMessage(
        { hello: 'world' },
        {
          [RABBITMQ_HEADER_ROUTING_KEY]: 'original.routing',
          [RABBITMQ_HEADER_RETRY_COUNT]: 2,
        },
        'fallback.routing',
      );

      await consumeHandler(msg);

      const dispatchedMessage = (dispatcher.dispatch as jest.Mock).mock.calls[0][0];
      expect(dispatchedMessage.routingKey).toBe('original.routing');
      expect(dispatchedMessage.metadata).toEqual({
        [RABBITMQ_HEADER_RETRY_COUNT]: 2,
      });
      expect(rawChannel.ack).toHaveBeenCalledWith(msg);
    });

    it('should nack malformed json without requeue', async () => {
      const channel = createChannel();
      const dispatcher = {
        dispatch: jest.fn().mockResolvedValue(undefined),
      } as unknown as ConsumerMessageBus;

      await consumer.consume(dispatcher, channel);

      const wrapper = channel.createChannelWrapper() as unknown as jest.Mocked<ChannelWrapper>;
      const rawChannel = {
        consume: jest.fn(),
        prefetch: jest.fn().mockResolvedValue(undefined),
        ack: jest.fn(),
        nack: jest.fn(),
      } as unknown as jest.Mocked<Channel>;
      const setupFn = (wrapper.addSetup as jest.Mock).mock.calls[0][0];
      await setupFn(rawChannel);

      const consumeHandler = (rawChannel.consume as jest.Mock).mock.calls[0][1] as (
        msg: ConsumeMessage | null,
      ) => Promise<void>;
      const msg = {
        content: Buffer.from('{broken-json'),
        properties: { headers: {} },
        fields: { routingKey: 'fallback.routing' },
      } as unknown as ConsumeMessage;

      await consumeHandler(msg);

      expect(dispatcher.dispatch).not.toHaveBeenCalled();
      expect(rawChannel.ack).not.toHaveBeenCalled();
      expect(rawChannel.nack).toHaveBeenCalledWith(msg, false, false);
    });
  });

  describe('onError', () => {
    let channel: jest.Mocked<AmqpChannel>;
    let amqpChannel: jest.Mocked<ChannelWrapper>;

    beforeEach(() => {
      channel = {
        config: {
          retryMessage: 3,
          deadLetterQueueFeature: true,
        },
      } as any;

      amqpChannel = {} as any;

      (consumer as any).channel = channel;
      (consumer as any).amqpChannel = amqpChannel;
    });

    it('should return when no amqpChannel is available', async () => {
      (consumer as any).amqpChannel = undefined;

      const errored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          metadata: { [RABBITMQ_HEADER_RETRY_COUNT]: 1 },
        },
      } as any;

      const result = await consumer.onError(errored, channel);

      expect(result).toBeUndefined();
      expect(mockRetrier.retryMessage).not.toHaveBeenCalled();
      expect(mockDeadLetter.sendToDeadLetter).not.toHaveBeenCalled();
    });

    it('should retry when retry count is below limit', async () => {
      const currentRetryCount = 2;
      const errored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          metadata: { [RABBITMQ_HEADER_RETRY_COUNT]: currentRetryCount },
        },
      } as any;

      await consumer.onError(errored, channel);

      expect(mockRetrier.retryMessage).toHaveBeenCalledWith(
        errored,
        channel,
        amqpChannel,
        currentRetryCount,
      );
      expect(mockDeadLetter.sendToDeadLetter).not.toHaveBeenCalled();
    });

    it('should default retry count to 0 when metadata is missing', async () => {
      const errored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          metadata: {},
        },
      } as any;

      await consumer.onError(errored, channel);

      expect(mockRetrier.retryMessage).toHaveBeenCalledWith(
        errored,
        channel,
        amqpChannel,
        0,
      );
    });

    it('should send to dead letter when retry limit is exceeded', async () => {
      const errored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          metadata: { [RABBITMQ_HEADER_RETRY_COUNT]: 5 },
        },
      } as any;

      await consumer.onError(errored, channel);

      expect(mockRetrier.retryMessage).not.toHaveBeenCalled();
      expect(mockDeadLetter.sendToDeadLetter).toHaveBeenCalledWith(
        errored,
        channel,
        amqpChannel,
      );
    });

    it('should send to dead letter when retry is not configured', async () => {
      const channelWithoutRetry = {
        config: {
          retryMessage: undefined,
          deadLetterQueueFeature: true,
        },
      } as any;

      const errored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          metadata: { [RABBITMQ_HEADER_RETRY_COUNT]: 1 },
        },
      } as any;

      await consumer.onError(errored, channelWithoutRetry);

      expect(mockRetrier.retryMessage).not.toHaveBeenCalled();
      expect(mockDeadLetter.sendToDeadLetter).toHaveBeenCalledWith(
        errored,
        channelWithoutRetry,
        amqpChannel,
      );
    });

    it('should not send to dead letter when feature is disabled', async () => {
      const channelWithDisabledDeadLetter = {
        config: {
          retryMessage: undefined,
          deadLetterQueueFeature: false,
        },
      } as any;

      const errored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          metadata: { [RABBITMQ_HEADER_RETRY_COUNT]: 1 },
        },
      } as any;

      await consumer.onError(errored, channelWithDisabledDeadLetter);

      expect(mockRetrier.retryMessage).not.toHaveBeenCalled();
      expect(mockDeadLetter.sendToDeadLetter).not.toHaveBeenCalled();
    });

    it('should send to dead letter when retry count equals limit', async () => {
      const errored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          metadata: { [RABBITMQ_HEADER_RETRY_COUNT]: 3 },
        },
      } as any;

      await consumer.onError(errored, channel);

      expect(mockRetrier.retryMessage).not.toHaveBeenCalled();
      expect(mockDeadLetter.sendToDeadLetter).toHaveBeenCalledWith(
        errored,
        channel,
        amqpChannel,
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should close connection and clear channel reference', async () => {
      const close = jest.fn().mockResolvedValue(undefined);
      (consumer as any).channel = {
        connection: {
          close,
        },
      };

      await consumer.onModuleDestroy();

      expect(close).toHaveBeenCalledTimes(1);
      expect((consumer as any).channel).toBeUndefined();
    });

    it('should only clear channel reference when connection does not exist', async () => {
      (consumer as any).channel = { connection: undefined };

      await consumer.onModuleDestroy();

      expect((consumer as any).channel).toBeUndefined();
    });
  });
});
