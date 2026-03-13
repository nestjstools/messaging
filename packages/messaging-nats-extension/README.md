<p align="center">
    <image src="nestjstools-logo.png" width="400">
</p>

# NestJS NATS Messaging Extension – High-Performance Message Bus for Distributed Systems

A production-ready NATS transport adapter for the **NestJSTools Messaging Library**, enabling high-performance, event-driven, and distributed architectures in NestJS applications.

This extension allows you to use **NATS** as a messaging channel inside the NestJSTools Messaging ecosystem, with full support for message buses, routing keys, handlers, consumers, and middleware.

Designed for:

* High-performance microservices
* Event-driven NestJS systems
* Real-time distributed systems
* Cloud-native or on-prem NATS deployments

---

## Documentation

* https://docs.nestjstools.com/messaging
* https://nestjstools.com

---

## Installation

```bash
npm install @nestjstools/messaging @nestjstools/messaging-nats-extension 
```

or

```bash
yarn add @nestjstools/messaging @nestjstools/messaging-nats-extension
```
## Nats Integration: Messaging Configuration Example

---

### Simple Config for nats messaging

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from '@nestjstools/messaging';
import { SendMessageHandler } from './handlers/send-message.handler';
import { MessagingNatsExtensionModule, NatsChannelConfig } from "@nestjstools/messaging-nats-extension";

@Module({
  imports: [
    MessagingNatsExtensionModule, // Importing the Nats extension module
    MessagingModule.forRoot({
      buses: [
        {
          name: 'nats-message.bus',
          channels: ['nats-message'],
        },
      ],
      channels: [
        new NatsChannelConfig({
          name: 'nats-message',
          enableConsumer: true, // Enable if you want to consume messages
          connectionUris: ['nats://localhost:4222'],
          subscriberName: 'nats-core',
        }),
      ],
      debug: true, // Optional: Enable debugging for Messaging operations
    }),
  ],
})
export class AppModule {}
```

### Config for Nats with JetStream

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from '@nestjstools/messaging';
import { SendMessageHandler } from './handlers/send-message.handler';
import { MessagingNatsExtensionModule, NatsJetStreamChannelConfig } from "@nestjstools/messaging-nats-extension";

@Module({
  imports: [
    MessagingNatsExtensionModule, // Importing the Nats extension module
    MessagingModule.forRoot({
      buses: [
        {
          name: 'nats-message.bus',
          channels: ['nats-channel-jetstream'],
        },
      ],
      channels: [
        new NatsJetStreamChannelConfig({
          name: 'nats-channel-jetstream',                  // Unique channel name in your app
          connectionUris: ['nats://localhost:4222'],       // URI of your NATS server
          enableConsumer: true,                            // Enables message consumer
          streamConfig: {
            streamName: 'event-steam',                     // Name of the JetStream stream
            deliverSubjects: ['my_app_command.*'],         // Subjects for stream
            autoUpdate: true,                              // Allow stream config update at app startup
          },
          consumerConfig: {
            durableName: 'nats-durable_name',              // Persistent consumer name (track offset)
            subject: 'my_app_command.*',                   // Specific subject this consumer listens to
            autoUpdate: true,                              // Allow consumer config update
          },
        }),
      ],
      debug: true, // Optional: Enable debugging for Messaging operations
    }),
  ],
})
export class AppModule {}
```

## Dispatch messages via bus (example)

```typescript
import { Controller, Get } from '@nestjs/common';
import { CreateUser } from './application/command/create-user';
import { IMessageBus, MessageBus, RoutingMessage } from '@nestjstools/messaging';

@Controller()
export class AppController {
  constructor(
    @MessageBus('nats-message.bus') private natsMessageBus: IMessageBus,
  ) {}

  @Get('/nats')
  createUser(): string {
    this.natsMessageBus.dispatch(new RoutingMessage(new CreateUser('John FROM Nats'), 'my_app_command.create_user'));

    return 'Message sent';
  }
}
```

### Handler for your message

```typescript
import { CreateUser } from '../create-user';
import { IMessageBus, IMessageHandler, MessageBus, MessageHandler, RoutingMessage, DenormalizeMessage } from '@nestjstools/messaging';

@MessageHandler('my_app_command.create_user')
export class CreateUserHandler implements IMessageHandler<CreateUser>{

  handle(message: CreateUser): Promise<void> {
    console.log(message);
    // TODO Logic there
  }
}
```
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
   Once the message is published with the correct routing key, it will be automatically routed to the appropriate handler within the NestJS application.
---

## Routing Strategy

Message routing behavior depends on the value of `subscriberName`:

* **Static Routing:**
  If `subscriberName` is a specific subject (e.g., `'order.created'`), all messages will be published directly to that subject.

* **Wildcard Routing:**
  If `subscriberName` contains a wildcard (e.g., `'order.*'` or `'order.>'`), the system uses `message.messageRoutingKey` as the publish subject instead. This enables dynamic routing based on the actual message type or topic.

### Example

```ts
// If subscriberName is 'order.*'
subscriberName = 'order.*';
message.messageRoutingKey = 'order.created';

// The message will be published to 'order.created'
```
or JetStream
```ts
// If JetStream deliverSubjects is ['order.*']
subject = 'order.*'; // from consumer
message.messageRoutingKey = 'order.created';

// The message will be published to 'order.created'
```

This strategy allows you to use a single subscriber to handle a range of message types dynamically.

---

## Configuration Options

### NatsChannel

| **Property**         | **Description**                                                                 | **Default Value** |
| -------------------- |---------------------------------------------------------------------------------| ----------------- |
| **`name`**           | The name of the NATS channel (e.g., `'nats-message'`).                          |                   |
| **`enableConsumer`** | Whether to enable message consumption (i.e., process incoming messages).        | `true`            |
| **`connectionUris`** | An array of NATS server URIs to connect to (e.g., `['nats://localhost:4222']`). |                   |
| **`subscriberName`** | A unique identifier for the subscriber (used in queue group subscriptions).     |                   |

---

> **Note:** NATS supports many configurations for streams, consumers, and subjects. If this setup doesn’t fit your specific use case, you can create your own custom NATS channel — this package and repository provide base classes that you can fork and modify to suit your needs.



### Real world working example with RabbitMQ & Redis - but might be helpful to understand how it works
https://github.com/nestjstools/messaging-rabbitmq-example
