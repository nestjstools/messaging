<p align="center">
    <image src="nestjstools-logo.png" width="400" alt="NestJSTools Logo" />
</p>

# NestJS RabbitMQ Integration – Messaging Extension for Distributed Systems

Official RabbitMQ channel adapter for the NestJSTools Messaging library.

This extension integrates **RabbitMQ (AMQP)** with the NestJS message bus abstraction, enabling reliable messaging, topic exchanges, dead-letter queues, retries.

Designed for scalable, event-driven and distributed architectures.

A NestJS library for managing asynchronous and synchronous messages with support for buses, handlers, channels, and
consumers. This library simplifies building scalable and decoupled applications by facilitating robust message handling
pipelines while ensuring flexibility and reliability.

### The RabbitMQ extension supports:

- Dead Letter Queue (DLQ)
- Message retry with configurable TTL
- Automatic retry queue creation
- Configurable retry attempts
- Safe failure handling

---

## Documentation

* https://docs.nestjstools.com/messaging
* https://nestjstools.com

---

## Installation

```bash
npm install @nestjstools/messaging @nestjstools/messaging-rabbitmq-extension 
```

or

```bash
yarn add @nestjstools/messaging @nestjstools/messaging-rabbitmq-extension
```

## RabbitMQ Integration: Messaging Configuration Example

---

```typescript
import { MessagingModule, InMemoryChannelConfig } from '@nestjstools/messaging';
import { SendMessageHandler } from './handlers/send-message.handler';
import {
  ExchangeType,
  MessagingRabbitmqExtensionModule,
  RmqChannelConfig,
} from '@nestjstools/messaging-rabbitmq-extension';


@Module({
  imports: [
    MessagingRabbitmqExtensionModule,
    MessagingModule.forRoot({
      buses: [
        {
          name: 'message.bus',
          channels: ['my-channel'],
        },
        {
          name: 'command-bus', //The naming is very flexible
          channels: ['amqp-command'], //be sure if you defined same channels name as you defined below 
        },
        {
          name: 'event-bus',
          channels: ['amqp-event'],
        },
      ],
      channels: [
        new InMemoryChannelConfig({
          name: 'my-channel',
          middlewares: [],
        }),
        new RmqChannelConfig({
          name: 'amqp-command',
          connectionUri: 'amqp://guest:guest@localhost:5672/',
          exchangeName: 'my_app_command.exchange',
          bindingKeys: ['my_app.command.#'],
          exchangeType: ExchangeType.TOPIC,
          middlewares: [],
          queue: 'my_app.command',
          autoCreate: true, // Create exchange, queue & bind keys
        }),
        new RmqChannelConfig({
          name: 'amqp-event',
          connectionUri: 'amqp://guest:guest@localhost:5672/',
          exchangeName: 'my_app_event.exchange',
          bindingKeys: ['my_app_event.#'],
          exchangeType: ExchangeType.TOPIC,
          queue: 'my_app.event',
          avoidErrorsForNotExistedHandlers: true, // We can avoid errors if we don't have handler yet for the event
          autoCreate: true,
        }),
      ],
      debug: true,
    }),
  ],
})
export class AppModule {
}
```

---

## Dispatch messages via bus (example)

```typescript
import { Controller, Get } from '@nestjs/common';
import { CreateUser } from './application/command/create-user';
import { IMessageBus, MessageBus, RoutingMessage } from '@nestjstools/messaging';

@Controller()
export class AppController {
  constructor(
    @MessageBus('command-bus') private commandBus: IMessageBus,
  ) {
  }

  @Get('/rabbitmq')
  createUser(): string {
    this.commandBus.dispatch(new RoutingMessage(new CreateUser('John'), 'my_app_command.create_user'));

    return 'Message sent';
  }
}
```

### Handler for your message

```typescript
import { CreateUser } from '../create-user';
import {
  IMessageBus,
  IMessageHandler,
  MessageBus,
  MessageHandler,
  RoutingMessage,
  DenormalizeMessage
} from '@nestjstools/messaging';

//This handler will received your rabbitmq messages with given routing-key
@MessageHandler('my_app_command.create_user')
export class CreateUserHandler implements IMessageHandler<CreateUser> {

  handle(message: CreateUser): Promise<void> {
    console.log(message);
    // TODO Logic there
  }
}
```

## Mapping Messages in RabbitMQ Channel

### Topic Exchange

For optimal routing, it's recommended to use routing keys as part of the binding key. For example, if you bind a queue
with the key `my_app.command.#`, messages with routing keys like `my_app.command.domain.action` will automatically be
routed to that queue. This ensures that any message with a routing key starting with `my_app.command` is directed to the
appropriate queue.
Here's a more concise and clear version of your explanation:

### Direct Exchange

Ensure your queue has defined binding keys, as messages will be routed to queues based on these keys. If no binding keys
are defined, the routing key in RabbitMQ will default to the routing key specified in the handler.

### Fanout Exchange

The Fanout Exchange broadcasts messages to all bound queues, ignoring the routing key. This type of exchange is useful
for scenarios where you need to distribute the same message to multiple consumers.

### Additional

* You can override message routing using `AmqpMessageOptions`. This allows sending a message to a specified exchange and
  routing it with a custom key.
    ```typescript
    this.messageBus.dispatch(new RoutingMessage(new SendMessage('Hello Rabbit!'), 'app.command.execute', new AmqpMessageOptions('exchange_name', 'rabbitmq_routing_key_to_queue')));
    ```

---

## 📨 Communicating Beyond a NestJS Application (Cross-Language Messaging)

### To enable communication with a Handler from services written in other languages, follow these steps:

1. **Publish a Message to the queue**

2. **Include the Routing Key Header**
   Your message **must** include a header attribute named `messaging-routing-key`.
   The value should correspond to the routing key defined in your NestJS message handler:
   ```ts
   @MessageHandler('my_app_command.create_user') // <-- Use this value as the routing key
   ```

3. **You're Done!**
   Once the message is published with the correct routing key, it will be automatically routed to the appropriate
   handler within the NestJS application.

---

## Configuration options

### AmqpChannel

#### **AmqpChannelConfig**

| **Property**                           | **Description**                                                                                                                                                                                                                                     | **Default Value** |
|----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| **`name`**                             | Name of the AMQP channel (e.g., `'amqp-command'`).                                                                                                                                                                                                  |                   |
| **`connectionUri`**                    | URI for the RabbitMQ connection, such as `'amqp://guest:guest@localhost:5672/'`.                                                                                                                                                                    |                   |
| **`exchangeName`**                     | The AMQP exchange name (e.g., `'my_app.exchange'`).                                                                                                                                                                                                 |                   |
| **`bindingKeys`**                      | The routing keys to bind to (e.g., `['my_app.command.#']`).                                                                                                                                                                                         | `[]`              |
| **`exchangeType`**                     | Type of the RabbitMQ exchange (e.g., `TOPIC`).                                                                                                                                                                                                      |                   |
| **`queue`**                            | The AMQP queue to consume messages from (e.g., `'my_app.command'`).                                                                                                                                                                                 |                   |
| **`autoCreate`**                       | Automatically creates the exchange, queue, and bindings if they don’t exist.                                                                                                                                                                        | `true`            |
| **`enableConsumer`**                   | Enables or disables the consumer for this channel.                                                                                                                                                                                                  | `true`            |
| **`avoidErrorsForNotExistedHandlers`** | Avoid errors if no handler is available for the message.                                                                                                                                                                                            | `false`           |
| **`deadLetterQueueFeature`**           | Enables a dead-letter queue to capture messages that could not be processed due to errors.                                                                                                                                                          | `false`           |
| **`retryMessage`**                     | Number of times to retry a message before sending it to the dead letter queue. Only applicable if `deadLetterQueueFeature` is enabled.                                                                                                              |                   |
| **`retryMessageTtl`**                  | Time to live for retry messages in milliseconds. After this time, messages will be moved from the retry queue back to the main exchange for reprocessing. Only applicable if `retryMessage` is set.                                                 | `1000`            |
| **`forceRecreateRetryQueue`**          | Whether to forcefully recreate the retry queue on application startup. This can be useful during development to ensure a clean state, but should be used with caution in production environments as it will delete all messages in the retry queue. |                   |

# Keywords

nestjs rabbitmq integration, nestjs amqp, nestjs message bus rabbitmq,
nestjs rabbitmq microservices, rabbitmq dead letter queue nestjs,
nestjs event driven architecture, distributed systems rabbitmq
