<p align="center">
    <image src="nestjstools-logo.png" width="400">
</p>

# NestJS Google Cloud Pub/Sub Messaging Extension – Event-Driven Transport for Distributed Systems

### This extension allows you to use **Google Cloud Pub/Sub as a message bus channel**.

A Google Cloud Pub/Sub transport adapter for the **NestJSTools Messaging Library**, enabling scalable, event-driven and distributed architectures in NestJS applications.

Designed for:

* Google Cloud microservices
* Event-driven systems
* CQRS architectures
* Cross-language messaging
* Distributed platforms running on GCP

---

## Documentation

* https://docs.nestjstools.com/messaging
* https://nestjstools.com

---

## Installation

```bash
npm install @nestjstools/messaging @nestjstools/messaging-google-pubsub-extension 
```

or

```bash
yarn add @nestjstools/messaging @nestjstools/messaging-google-pubsub-extension
```
## Google PubSub Integration: Messaging Configuration Example

---

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from '@nestjstools/messaging';
import { SendMessageHandler } from './handlers/send-message.handler';
import { MessagingGooglePubSubExtensionModule, GooglePubSubChannelConfig } from '@nestjstools/messaging-google-pubsub-extension';

@Module({
  imports: [
    MessagingGooglePubSubExtensionModule, // Importing the GooglePubSub extension module
    MessagingModule.forRoot({
      buses: [
        {
          name: 'message.bus',
          channels: ['pubsub-command'],
        },
      ],
      channels: [
        new GooglePubSubChannelConfig({
          name: 'pubsub-command',
          enableConsumer: true, // Enable if you want to consume messages
          autoCreate: true, // Auto-create queue if it doesn't exist
          credentials: { // Optional
            projectId: 'x',
          },
          topicName: 'eventTopic',
          subscriptionName: 'eventSubscriptionTopic',
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
    @MessageBus('message.bus') private pubsubMessageBus: IMessageBus,
  ) {}

  @Get('/pubsub')
  createUser(): string {
    this.pubsubMessageBus.dispatch(new RoutingMessage(new CreateUser('John FROM pubsub'), 'my_app_command.create_user'));

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

---

### Key Features:

* **Google Cloud Pub/Sub Integration** Seamlessly send and receive messages using Google Cloud Pub/Sub within your NestJS application.

* **Local Development Support with Emulator** Supports running against the Google Pub/Sub emulator for local development and testing (via PUBSUB_EMULATOR_HOST).

* **Automatic Topic and Subscription Creation** Automatically creates Pub/Sub topics and subscriptions when autoCreate: true is set in the configuration.

* **Named Buses & Channel Routing** Supports custom-named message buses and routing of messages across multiple channels for event-driven architecture.

* Easily configure projectId, topicName, and subscriptionName for full control over Pub/Sub setup.
---

## 📨 Communicating Beyond a NestJS Application (Cross-Language Messaging)

### To enable communication with a Handler from services written in other languages, follow these steps:

1. **Publish a Message to the Topic**

2. **Include the Routing Key Header**
   Your message **must** include a header attribute named `messaging-routing-key`.
   The value should correspond to the routing key defined in your NestJS message handler:

   ```ts
   @MessageHandler('my_app_command.create_user') // <-- Use this value as the routing key
   ```

---
## 🔧 Send additional attributes into your message

   ```ts
    this.pubSubMessageBus.dispatch(new RoutingMessage(new CreateUser('id'), 'my_app_command.create_user', new GooglePubSubMessageOptions({YourAttribute: 'value'})));
   ```
---

## Configuration options

### GooglePubSubChannel

#### **GooglePubSubChannelConfig**

| **Property**           | **Description**                                                                                  | **Default Value** |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ----------------- |
| **`name`**             | The name of the messaging channel within your app (used for internal routing).                   |                   |
| **`credentials`**      | Google Cloud Pub/Sub credentials (e.g., `{ projectId: 'my-project' }`).                          |                   |
| **`enableConsumer`**   | Whether to enable message consumption (i.e., subscribing and processing messages from Pub/Sub).  | `true`            |
| **`autoCreate`**       | Automatically create the topic and subscription if they do not exist in the Pub/Sub environment. | `true`            |
| **`topicName`**        | The name of the Google Pub/Sub topic to publish messages to.                                     |                   |
| **`subscriptionName`** | The name of the subscription used to consume messages from the topic.                            |                   |

---

## Real world working example with RabbitMQ & Redis - but might be helpful to understand how it works
https://github.com/nestjstools/messaging-rabbitmq-example
