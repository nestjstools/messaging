import { type Mocked, type Mock, vi } from 'vitest';
import { MessageDeadLetterVisitor } from '../../../src/consumer/message-dead-letter.visitor.js';
import { AmqpChannel } from '../../../src/channel/amqp.channel.js';
import { RABBITMQ_HEADER_ROUTING_KEY } from '../../../src/const.js';
import { ConsumerDispatchedMessageError } from '@nestjstools/messaging';
import { ChannelWrapper } from 'amqp-connection-manager';

describe('MessageDeadLetterVisitor', () => {
  let visitor: MessageDeadLetterVisitor;
  let mockAmqpChannel: Mocked<ChannelWrapper>;
  let mockChannel: Mocked<AmqpChannel>;

  beforeEach(() => {
    visitor = new MessageDeadLetterVisitor();

    mockAmqpChannel = {
      publish: vi.fn(),
    } as any;

    mockChannel = {
      config: {
        queue: 'test-queue',
      },
    } as any;
  });

  describe('sendToDeadLetter', () => {
    it('should publish message to dead letter exchange with correct parameters', async () => {
      const mockMessage = { id: 1, data: 'test' };
      const mockRoutingKey = 'original.routing.key';

      const mockErrored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          message: mockMessage,
          routingKey: mockRoutingKey,
        },
      } as any;

      await visitor.sendToDeadLetter(mockErrored, mockChannel, mockAmqpChannel);

      expect(mockAmqpChannel.publish).toHaveBeenCalledWith(
        'dead_letter.exchange',
        'test-queue_dead_letter',
        Buffer.from(JSON.stringify(mockMessage)),
        {
          headers: {
            [RABBITMQ_HEADER_ROUTING_KEY]: mockRoutingKey,
          },
        },
      );
    });

    it('should handle complex message objects', async () => {
      const complexMessage = {
        user: { id: 123, name: 'John' },
        metadata: { timestamp: '2023-01-01', version: '1.0' },
      };

      const mockErrored: ConsumerDispatchedMessageError = {
        dispatchedConsumerMessage: {
          message: complexMessage,
          routingKey: 'user.created',
        },
      } as any;

      await visitor.sendToDeadLetter(mockErrored, mockChannel, mockAmqpChannel);

      expect(mockAmqpChannel.publish).toHaveBeenCalledWith(
        'dead_letter.exchange',
        'test-queue_dead_letter',
        Buffer.from(JSON.stringify(complexMessage)),
        {
          headers: {
            [RABBITMQ_HEADER_ROUTING_KEY]: 'user.created',
          },
        },
      );
    });
  });
});
