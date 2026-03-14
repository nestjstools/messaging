import { Global, Module } from '@nestjs/common';
import { AmqpMessageBusFactory } from './message-bus/amqp-message-bus-factory';
import { RabbitmqMessagingConsumer } from './consumer/rabbitmq-messaging.consumer';
import { RabbitmqMigrator } from './migrator/rabbitmq.migrator';
import { RmqChannelFactory } from './channel/rmq-channel-factory';
import { MessageRetrierVisitor } from './consumer/message-retrier.visitor';
import { MessageDeadLetterVisitor } from './consumer/message-dead-letter.visitor';

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
