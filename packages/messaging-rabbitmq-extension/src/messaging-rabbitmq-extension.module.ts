import { Global, Module } from '@nestjs/common';
import { AmqpMessageBusFactory } from './message-bus/amqp-message-bus-factory.js';
import { RabbitmqMessagingConsumer } from './consumer/rabbitmq-messaging.consumer.js';
import { RabbitmqMigrator } from './migrator/rabbitmq.migrator.js';
import { RmqChannelFactory } from './channel/rmq-channel-factory.js';
import { MessageRetrierVisitor } from './consumer/message-retrier.visitor.js';
import { MessageDeadLetterVisitor } from './consumer/message-dead-letter.visitor.js';

@Global()
@Module({
  providers: [
    RabbitmqMigrator,
    AmqpMessageBusFactory,
    RmqChannelFactory,
    RabbitmqMessagingConsumer,
    MessageRetrierVisitor,
    MessageDeadLetterVisitor,
  ],
})
export class MessagingRabbitmqExtensionModule {}
