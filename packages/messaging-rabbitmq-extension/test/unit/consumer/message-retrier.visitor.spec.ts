import { MessageRetrierVisitor } from '../../../src/consumer/message-retrier.visitor';
import { AmqpChannel } from '../../../src/channel/amqp.channel';
import { RABBITMQ_HEADER_RETRY_COUNT, RABBITMQ_HEADER_ROUTING_KEY } from '../../../src/const';
import { ConsumerDispatchedMessageError } from '@nestjstools/messaging';
import { ChannelWrapper } from 'amqp-connection-manager';

describe('MessageRetrierVisitor', () => {
  let visitor: MessageRetrierVisitor;
  let mockAmqpChannel: jest.Mocked<ChannelWrapper>;
  let mockChannel: jest.Mocked<AmqpChannel>;

  beforeEach(() => {
    visitor = new MessageRetrierVisitor();

    mockAmqpChannel = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockChannel = {
      config: {
        exchangeName: 'test-exchange',
      },
    } as any;
  });

  describe('retryMessage', () => {
    it('should publish message to retry exchange with incremented retry count', async () => {
      const mockMessage = { id: 1, data: 'test' };
      const mockRoutingKey = 'user.created';
      const currentRetryCount = 2;

      const mockErrored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          message: mockMessage,
          routingKey: mockRoutingKey,
        },
      } as any;

      await visitor.retryMessage(mockErrored, mockChannel, mockAmqpChannel, currentRetryCount);

      expect(mockAmqpChannel.publish).toHaveBeenCalledWith(
        'test-exchange_retry.exchange',
        mockRoutingKey,
        Buffer.from(JSON.stringify(mockMessage)),
        {
          headers: {
            [RABBITMQ_HEADER_RETRY_COUNT]: 3,
            [RABBITMQ_HEADER_ROUTING_KEY]: mockRoutingKey,
          },
        }
      );
    });

    it('should handle first retry attempt (retry count 0)', async () => {
      const mockMessage = { value: 'test-data' };
      const mockRoutingKey = 'order.processed';
      const currentRetryCount = 0;

      const mockErrored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          message: mockMessage,
          routingKey: mockRoutingKey,
        },
      } as any;

      await visitor.retryMessage(mockErrored, mockChannel, mockAmqpChannel, currentRetryCount);

      expect(mockAmqpChannel.publish).toHaveBeenCalledWith(
        'test-exchange_retry.exchange',
        mockRoutingKey,
        Buffer.from(JSON.stringify(mockMessage)),
        {
          headers: {
            [RABBITMQ_HEADER_RETRY_COUNT]: 1,
            [RABBITMQ_HEADER_ROUTING_KEY]: mockRoutingKey,
          },
        }
      );
    });

    it('should handle complex message objects', async () => {
      const complexMessage = {
        user: { id: 456, email: 'test@example.com' },
        payload: { items: [1, 2, 3] },
      };
      const mockRoutingKey = 'complex.message';
      const currentRetryCount = 5;

      const mockErrored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          message: complexMessage,
          routingKey: mockRoutingKey,
        },
      } as any;

      const result = await visitor.retryMessage(mockErrored, mockChannel, mockAmqpChannel, currentRetryCount);

      expect(mockAmqpChannel.publish).toHaveBeenCalledWith(
        'test-exchange_retry.exchange',
        mockRoutingKey,
        Buffer.from(JSON.stringify(complexMessage)),
        {
          headers: {
            [RABBITMQ_HEADER_RETRY_COUNT]: 6,
            [RABBITMQ_HEADER_ROUTING_KEY]: mockRoutingKey,
          },
        }
      );
      expect(result).toBeUndefined();
    });
  });
});
