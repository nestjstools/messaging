# @nestjstools/messaging

A NestJS library for managing asynchronous and synchronous messages with support for buses, handlers, channels, and consumers. This library simplifies building scalable and decoupled applications by facilitating robust message handling pipelines while ensuring flexibility and reliability.

---

## Features
- **Message Buses**: Define multiple buses for commands, events, and queries to streamline message routing.
- **Handlers**: Easily register and manage handlers for processing messages.
- **Channels**: Support for in-memory channels and **easy extension** to create custom channel implementations tailored to your needs.
- **Consumers**: Run message consumers to process queued messages asynchronously, ensuring system reliability and fault tolerance.
- **Middleware Support**: Add custom middleware for message transformation such like validation, logging - do whatever you want.
- **Debug Mode**: Enable enhanced logging and debugging capabilities for development.
- **Extensibility**: Creating new channels is straightforward, allowing developers to expand and integrate with external systems or protocols effortlessly.

---

## Installation

```bash
npm install @nestjstools/messaging
```

or

```bash
yarn add @nestjstools/messaging
```

## Getting Started

### Basic Usage (In-memory)

```typescript
import { MessagingModule } from '@nestjstools/messaging';
import { InMemoryChannelConfig } from '@nestjstools/messaging/channels';
import { SendMessageHandler } from './handlers/send-message.handler';

@Module({
  imports: [
    MessagingModule.forRoot({
      buses: [
        {
          name: 'message.bus',
          channels: ['my-channel'],
        },
      ],
      channels: [
        new InMemoryChannelConfig({
          name: 'my-channel',
          middlewares: [],
        }),
      ],
      debug: true,
    }),
  ],
})
export class AppModule {}
```

### Define a Message & Message Handler

Create a new handler that processes specific message

#### Define your message
```typescript
export class SendMessage {
  constructor(
    public readonly content: string,
  ) {
  }
}

```
#### Define your message handler
```typescript
import { SendMessage } from './send-message';
import { MessageResponse } from '@nestjstools/messaging/message';
import { MessageHandler } from '@nestjstools/messaging/decorators';
import { IMessageHandler } from '@nestjstools/messaging/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
@MessageHandler('your.message')
export class SendMessageHandler implements IMessageHandler<SendMessage> {
  async handle(message: SendMessage): Promise<MessageResponse | void> {
    console.log(message.content);
    // Example handling logic
  }
}
```

### Next Step: Dispatching a Message

Messages can be dispatched from anywhere in your application—whether from services, controllers, or other components. Here’s an example using an HTTP endpoint:

```typescript
import { Controller, Get } from '@nestjs/common';
import { MessageBus } from '@nestjstools/messaging/dependency-injection';
import { IMessageBus } from '@nestjstools/messaging/bus';
import { RoutingMessage } from '@nestjstools/messaging/message';
import { SendMessage } from './test/send-message';

@Controller()
export class AppController {
  //You can inject every bus which you defined in configuration
  constructor(@MessageBus('message.bus') private readonly messageBus: IMessageBus) {}

  @Get()
  async dispatchMessage(): Promise<string> {
    // Dispatching a SendMessage instance with a route
    await this.messageBus.dispatch(
      new RoutingMessage(new SendMessage('Message from HTTP request'), 'your.message'),
    );

    return 'Message dispatched successfully!';
  }
}
```

### Explanation:

1. **Flexible Dispatching**:
    - You can call the `dispatch` method from any layer (e.g., controller, service, or scheduled job). This example uses an HTTP `GET` endpoint for demonstration.

2. **`@MessageBus` Decorator**:
    - Injects the particular message bus (identified by its name, `message.bus`) into the `AppController`.

3. **Routing and Payload**:
    - Wrap the payload (`SendMessage`) in a `RoutingMessage` to specify its route (`edm.command.execute`), which ensures the message is handled by the appropriate handler.
    
4. **HTTP Trigger**:
    - This implementation illustrates an entry point triggered via an HTTP request, showcasing how simple it is to connect the messaging system to a web interface.

### ⚠️ Warning!
🚨 Important Notice: You can return responses from handlers, but currently, it only works with the `InMemoryChannel`. This behavior may not function as expected if multiple handlers are processing a single message.

🛠️ Please ensure you're using a compatible setup when working with multiple handlers, as this could result in unexpected behavior.

---

## RabbitMQ Integration: Messaging Configuration Example

---

The `MessagingModule` provides out-of-the-box integration with **RabbitMQ**, enabling the use of **AMQP** channels alongside in-memory channels. The configuration below demonstrates **CQRS** by separating command and event buses, ensuring seamless integration of your application with RabbitMQ's flexible messaging capabilities for both **command** and **event handling** + command dispatching.

## To make it works for rabbitmq
We need to install rabbitmq extension for `@nestjstools/messaging`

```bash
npm install @nestjstools/messaging-rabbitmq-extension
```

or

```bash
yarn add @nestjstools/messaging-rabbitmq-extension
```

```typescript
import { MessagingModule } from '@nestjstools/messaging';
import { InMemoryChannelConfig, AmqpChannelConfig, ExchangeType } from '@nestjstools/messaging/channels';
import { SendMessageHandler } from './handlers/send-message.handler';

@Module({
  imports: [
    MessagingModule.forRoot({
      buses: [
        {
          name: 'message.bus',
          channels: ['my-channel'],
        },
        {
          name: 'command-bus', // The naming is very flexible
          channels: ['amqp-command'], // Be sure if you defined same channels name as you defined below 
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
        new AmqpChannelConfig({
          name: 'amqp-command',
          connectionUri: 'amqp://guest:guest@localhost:5672/',
          exchangeName: 'my_app.exchange',
          bindingKeys: ['my_app.command.#'],
          exchangeType: ExchangeType.TOPIC,
          middlewares: [],
          queue: 'my_app.command',
          autoCreate: true, // Create exchange, queue & bind keys
        }),
        new AmqpChannelConfig({
          name: 'amqp-event',
          connectionUri: 'amqp://guest:guest@localhost:5672/',
          exchangeName: 'my_app.exchange',
          bindingKeys: ['my_app.event.#'],
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
export class AppModule {}
```

---

### Key Features:

1. **Multiple Message Buses**:
    - Configure distinct buses for **in-memory**, **commands**, and **events**:
        - `message.bus` (in-memory).
        - `command.message-bus` (AMQP command processing).
        - `event.message-bus` (AMQP event processing).

2. **In-Memory Channel**:
    - Simple and lightweight channel suitable for non-persistent messaging or testing purposes.

3. **AMQP Channels**:
    - Fully integrated RabbitMQ channel configuration using `AmqpChannelConfig`.

4. **Channel Details**:
    - `connectionUri`: Specifies the RabbitMQ server connection.
    - `exchangeName`: The AMQP exchange to publish or consume messages from.
    - `bindingKeys`: Define message routing patterns using wildcards (e.g., `my_app.command.#`).
    - `exchangeType`: Supports RabbitMQ exchange types such as `TOPIC`.
    - `queue`: Specify a RabbitMQ queue to consume messages from.
    - `autoCreate`: Automatically creates the exchange, queue, and bindings if they don’t exist.

5. **Error Handling**:
    - Use `avoidErrorsForNotExistedHandlers` in `amqp-event` to gracefully handle missing handlers for event messages.

6. **Debug Mode**:
    - Enable `debug: true` to assist in monitoring and troubleshooting messages.

This configuration provides a solid foundation for integrating RabbitMQ as part of your messaging system. It facilitates the decoupling of commands, events, and in-memory operations, ensuring reliable and scalable communication across distributed systems.

---

## Mapping Messages in RabbitMQ Channel

### Topic Exchange
For optimal routing, it's recommended to use routing keys as part of the binding key. For example, if you bind a queue with the key `my_app.command.#`, messages with routing keys like `my_app.command.domain.action` will automatically be routed to that queue. This ensures that any message with a routing key starting with `my_app.command` is directed to the appropriate queue.
Here's a more concise and clear version of your explanation:

### Direct Exchange
Ensure your queue has defined binding keys, as messages will be routed to queues based on these keys. If no binding keys are defined, the routing key in RabbitMQ will default to the routing key specified in the handler.

### Additional
* You can override message routing using `AmqpMessageOptions`. This allows sending a message to a specified exchange and routing it with a custom key.
    ```typescript
    this.messageBus.dispatch(new RoutingMessage(new SendMessage('Hello Rabbit!'), 'app.command.execute', new AmqpMessageOptions('exchange_name', 'rabbitmq_routing_key_to_queue')));
    ```

---

## <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M160-40v-240h100v-80H160v-240h100v-80H160v-240h280v240H340v80h100v80h120v-80h280v240H560v-80H440v80H340v80h100v240H160Zm80-80h120v-80H240v80Zm0-320h120v-80H240v80Zm400 0h120v-80H640v80ZM240-760h120v-80H240v80Zm60-40Zm0 320Zm400 0ZM300-160Z"/></svg> Middlewares

A **middleware** in the context of the `MessagingModule` is a function that processes messages as they pass through the message pipeline. The middleware can intercept, modify, or log messages before they are handled by the respective **message handler**. This is particularly useful for logging, authentication, validation, or any other pre-processing step before the actual business logic is applied.

Each **channel** in the messaging system has its own set of middlewares, and these middlewares are executed in order when a message is dispatched through the respective channel.

### How to Use Middleware in Messaging Channels:

To use middleware, you need to:

1. **Define the middleware class** that implements the `Middleware` interface, which contains the `next` method that processes the message.
2. **Attach the middleware to a specific channel** via the channel configuration.

### Example Middleware Code:

Here's an example middleware class that logs a message when the middleware is applied.

```typescript
import { Injectable } from '@nestjs/common';
import { Middleware } from '@nestjstools/messaging/middleware/middleware';
import { RoutingMessage } from '@nestjstools/messaging/message/routing-message';

@Injectable()
@MessagingMiddleware('TestMiddleware-random-name')
export class TestMiddleware implements Middleware {
  // This method is called when a message passes through this middleware
  async next(next: RoutingMessage): Promise<RoutingMessage> {
    console.log('!!!! WORKS');  // Log or process the message here
    return next;  // Pass the message to the next step in the pipeline
  }
}
```

### Attaching Middleware to a Channel:

Now that we've defined the middleware, it needs to be attached to a specific channel in the `MessagingModule` configuration. Here's how you would configure the middleware for a channel:

```typescript
import { MessagingModule } from '@nestjstools/messaging';
import { AmqpChannelConfig, InMemoryChannelConfig } from '@nestjstools/messaging/channels';
import { TestMiddleware } from './middlewares/test.middleware';
import { SendMessageHandler } from './handlers/send-message.handler';

@Module({
  imports: [
    MessagingModule.forRoot({
      buses: [
        {
          name: 'message.bus',
          channels: ['my-channel'],
        },
      ],
      channels: [
        new InMemoryChannelConfig({
          name: 'my-channel',
          middlewares: [TestMiddleware],  // Attach TestMiddleware to this channel
        }),
        new AmqpChannelConfig({
          name: 'amqp-command',
          connectionUri: 'amqp://guest:guest@localhost:5672/',
          exchangeName: 'my_app.exchange',
          bindingKeys: ['my_app.command.#'],
          exchangeType: ExchangeType.TOPIC,
          queue: 'my_app.command',
          autoCreate: true,
          enableConsumer: true,
          middlewares: [TestMiddleware],  // Attach TestMiddleware to this AMQP channel
        }),
      ],
      debug: true,
    }),
  ],
})
export class AppModule {}
```

### Explanation of How It Works:

1. **Middleware Class**:
    - A `Middleware` is a class that implements the `next` method. In this case, the `TestMiddleware` simply logs `'!!!! WORKS'` and allows the message to continue.

2. **Message Pipeline**:
    - When a message is dispatched, it passes through the series of middlewares configured for its channel.
    - The middlewares execute in the order they're listed for the channel, and each `next` method decides what happens to the message—whether it continues or gets transformed.

3. **Channel-Specific Middlewares**:
    - Each channel can have its own set of middlewares defined in the channel's configuration (e.g., `InMemoryChannelConfig` and `AmqpChannelConfig`).
    - This allows flexible control of how messages are processed depending on the channel, enabling different logic for each transport mechanism (in-memory vs. RabbitMQ).

### Benefits of Using Middlewares:
- **Separation of Concerns**: Middlewares help encapsulate cross-cutting concerns like logging, validation, and authentication, making the code cleaner.
- **Reusability**: A middleware can be reused across different channels to perform the same actions on various messages.
- **Custom Logic**: You can apply custom transformations, logging, or other types of business logic to messages as they move through the pipeline.

---

## Configuration options
Here’s a table with the documentation for the `MessagingModule.forRoot` configuration you requested, breaking it into **buses**, **channels** (with descriptions of both channels), and their respective properties, descriptions, and default values:

### `MessagingModule.forRoot` Configuration
<br>

| **Property**   | **Description**                                                        | **Default Value**             |
|----------------|------------------------------------------------------------------------|-------------------------------|
| **`buses`**    | Array of message buses that define routing and processing of messages. | `[]` (empty array by default) |
| **`channels`** | Array of channel configurations used by the message buses.             | `[]` (empty array by default) |
| **`debug`**    | Enables or disables debug mode for logging additional messages.        | `false`                       |
| **`logging`**  | Enables or disables logging for bus activity (e.g., message dispatch). | `false`                       |

---

### Buses

| **Property**   | **Description**                                                      | **Default Value** |
|----------------|----------------------------------------------------------------------|-------------------|
| **`name`**     | Name of the message bus (e.g., 'command.message-bus').               |                   |
| **`channels`** | List of channel names to be used by this bus (e.g., `'my-channel'`). | `[]`              |

---

### Channels

#### 1. **InMemoryChannelConfig**

| **Property**                           | **Description**                                          | **Default Value** |
|----------------------------------------|----------------------------------------------------------|-------------------|
| **`name`**                             | Name of the in-memory channel (e.g., `'my-channel'`).    |                   |
| **`middlewares`**                      | List of middlewares to apply to the channel.             | `[]`              |
| **`avoidErrorsForNotExistedHandlers`** | Avoid errors if no handler is available for the message. | `false`           |

#### 2. **AmqpChannelConfig**

| **Property**                           | **Description**                                                                  | **Default Value** |
|----------------------------------------|----------------------------------------------------------------------------------|-------------------|
| **`name`**                             | Name of the AMQP channel (e.g., `'amqp-command'`).                               |                   |
| **`connectionUri`**                    | URI for the RabbitMQ connection, such as `'amqp://guest:guest@localhost:5672/'`. |                   |
| **`exchangeName`**                     | The AMQP exchange name (e.g., `'my_app.exchange'`).                              |                   |
| **`bindingKeys`**                      | The routing keys to bind to (e.g., `['my_app.command.#']`).                      | `[]`              |
| **`exchangeType`**                     | Type of the RabbitMQ exchange (e.g., `TOPIC`).                                   |                   |
| **`queue`**                            | The AMQP queue to consume messages from (e.g., `'my_app.command'`).              |                   |
| **`autoCreate`**                       | Automatically creates the exchange, queue, and bindings if they don’t exist.     | `true`            |
| **`enableConsumer`**                   | Enables or disables the consumer for this channel.                               | `true`            |
| **`avoidErrorsForNotExistedHandlers`** | Avoid errors if no handler is available for the message.                         | `false`           |

This table provides a structured overview of the **`MessagingModule.forRoot`** configuration, with details about each property within **buses** and **channels** and their corresponding default values.

## Creating Your Own Channel and Bus
This process allows you to define and integrate a custom **Channel** and **MessageBus** for your application, giving you complete flexibility and control over how messages are processed, dispatched, and consumed. Each step provides the necessary building blocks to create your own transport layer with full integration into the `MessagingModule`.

### 1. Create a `ChannelConfig`
A `ChannelConfig` class holds the configuration required to establish a stable connection to your service (e.g., RabbitMQ, Redis, etc.). Your class should implement the `ChannelConfig` interface and define necessary data like the channel name and middlewares.

```typescript
export class YourChannelConfig implements ChannelConfig {
  public readonly name: string;
  public readonly middlewares: object[];

  constructor({ name, middlewares }: AmqpChannelConfig) {
    this.name = name;
    this.middlewares = middlewares ?? [];  // Default to empty array if no middlewares provided
  }
}
```

### 2. Create a `Channel`
Next, create a class that implements the `Channel` interface. This class will serve as your `DataSource` and utilize the configuration you defined in the `ChannelConfig` class.

```typescript
export class YourChannel extends Channel {}
```

### 3. Create a `ChannelFactory`
A `ChannelFactory` is responsible for creating instances of your custom `Channel` class. It implements the `IChannelFactory` interface and ensures proper injection into your app.

```typescript
@Injectable()
@ChannelFactory(YourChannel)
export class YourChannelFactory implements IChannelFactory {
   create(channelConfig: ChannelConfig): Channel {
      if (!(channelConfig instanceof YourChannelConfig)) {
         throw new InvalidChannelConfigException(YourChannel.name);
      }

      return new YourChannel(channelConfig);
   }
}
```

### 4. Create a `MessageBus`
The `MessageBus` handles the dispatching of messages in your system. Create a class implementing the `IMessageBus` interface to send messages to your custom service (e.g., RabbitMQ, Redis, etc.).

```typescript
@Injectable()
export class YourMessageBus implements IMessageBus {
  constructor(private readonly yourChannel: YourChannel) {}

  async dispatch(message: RoutingMessage): Promise<MessageResponse | void> {
    // Write your logic here to dispatch the message to your channel (e.g., RabbitMQ)
  }
}
```

### 5. Create a `MessageBusFactory`
The `MessageBusFactory` creates instances of your `MessageBus` and ensures it's properly integrated with your `Channel`. It implements the `IMessageBusFactory` interface.

```typescript
@Injectable()
@MessageBusFactory(YourChannel)
export class YourMessageBusFactory implements IMessageBusFactory {
  create(channel: Channel): IMessageBus {
    if (!(channel instanceof YourChannel)) {
       throw new InvalidChannelException(YourChannel.name);
    }

    return new YourMessageBus(channel);  // Return a new instance of your message bus
  }
}
```

### 6. Create a Consumer `MessageConsumer`
A consumer receives and processes messages. Create a class that implements the `IMessagingConsumer` interface and handle the message processing within the `consume` method.

```typescript
@Injectable()
@MessageConsumer(YourChannel)
export class YourMessagingConsumer implements IMessagingConsumer {
  async consume(dispatcher: ConsumerMessageDispatcher, channel: Channel): Promise<void> {
    if (!(channel instanceof AmqpChannel)) {
      throw new Error(`Only YourChannel is supported in ${YourMessagingConsumer.name}`);
    }

    // Logic to consume a message...
    dispatcher.dispatch(new ConsumerMessage(rabbitMqMessage.body, rabbitMqMessage.headers[RABBITMQ_HEADER_ROUTING_KEY] ?? rabbitMqMessage.routingKey));

    return Promise.resolve();
  }

  onError(errored: ConsumerDispatchedMessageError, channel: Channel): Promise<void> {
    // Handle error if message processing fails
    return Promise.resolve();
  }
}
```

### 7. Add Custom `MessageOptions` to Your Bus (Optional)
You can create custom message options for your message bus if additional configuration is required, such as custom middlewares or headers.

```typescript
export class YourMessageOptions implements MessageOptions {
  constructor(public readonly middlewares: Middleware[] = []) {}
}
```

Classes with `Injectable()` decorator must be defined as providers in somewhere in application.

---

### Future features
* INBOX & OUTBOX Pattern
* Dead letter queue for RabbitMQ
* Supports other adapters such like Redis
