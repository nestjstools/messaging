<p align="center">
    <image src="nestjstools-logo.png" width="400" alt="NestJSTools Logo" />
</p>

# NestJS Amazon SQS Messaging Extension – Scalable Message Bus for Distributed Systems

Amazon SQS transport adapter for the **NestJSTools Messaging Library**, enabling scalable, fault-tolerant, and event-driven architectures in NestJS applications.

This extension allows you to use **Amazon Simple Queue Service (SQS)** as a messaging channel within the NestJSTools Messaging ecosystem, supporting message buses, routing keys, handlers, consumers, and middleware - all with clean and strongly-typed NestJS integration.

Designed for:

* AWS microservices architectures
* Event-driven NestJS systems
* Distributed systems requiring reliable message processing
* Cloud-native services running on Amazon Web Services

---
## Documentation

* https://docs.nestjstools.com/messaging
* https://nestjstools.com

---

## Installation

```bash
npm install @nestjstools/messaging @nestjstools/messaging-amazon-sqs-extension 
```

or

```bash
yarn add @nestjstools/messaging @nestjstools/messaging-amazon-sqs-extension
```
## AmazonSQS Integration: Messaging Configuration Example

---

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from '@nestjstools/messaging';
import { SendMessageHandler } from './handlers/send-message.handler';
import { AmazonSqsChannelConfig, MessagingAmazonSqsExtensionModule } from '@nestjstools/messaging-amazon-sqs-extension';

@Module({
  imports: [
    MessagingAmazonSqsExtensionModule, // Importing the SQS extension module
    MessagingModule.forRoot({
      buses: [
        {
          name: 'message.bus',
          channels: ['sqs-channel'],
        },
      ],
      channels: [
        new AmazonSqsChannelConfig({
          name: 'sqs-channel',
          enableConsumer: true, // Enable if you want to consume messages
          region: 'us-east-1',
          queueUrl: 'http://localhost:9324/queue/test_queue', // ElasticMQ for local development
          autoCreate: true, // Auto-create queue if it doesn't exist
          credentials: { // Optional credentials for SQS
            accessKeyId: 'x',
            secretAccessKey: 'x',
          },
          maxNumberOfMessages: 3, // optional
          visibilityTimeout: 10, // optional 
          waitTimeSeconds: 5, // Every 5 seconds consumer will pull 3 messages from queue - optional,
          deadLetterQueue: false,
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
    @MessageBus('message.bus') private sqsMessageBus: IMessageBus,
  ) {}

  @Get('/sqs')
  createUser(): string {
    this.sqsMessageBus.dispatch(new RoutingMessage(new CreateUser('John FROM SQS'), 'my_app_command.create_user'));

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
   Your message **must** include a header attribute named `messagingRoutingKey`.
   The value should correspond to the routing key defined in your NestJS message handler:

   ```ts
   @MessageHandler('my_app_command.create_user') // <-- Use this value as the routing key
   ```

3. **You're Done!**
   Once the message is published with the correct routing key, it will be automatically routed to the appropriate handler within the NestJS application.
---

## 🏷️ Sending Custom SQS Message Attributes

In addition to the required `messagingRoutingKey` header, you can include **custom attributes** in your SQS messages to enrich the message with metadata such as request IDs, user types, or priority levels.

### Example: Sending a Message with Attributes

```ts
const exampleAttributes = {
  requestId: {
    DataType: "String",
    StringValue: "req-" + Math.random().toString(36).substring(2, 10),
  },
  timestamp: {
    DataType: "Number",
    StringValue: Date.now().toString(),
  },
  userType: {
    DataType: "String",
    StringValue: "admin",
  },
  priority: {
    DataType: "Number",
    StringValue: "1",
  },
};

this.sqsMessageBus.dispatch(
  new RoutingMessage(
    new CreateUser('John FROM Sqs'),
    'my_app_command.create_user',
    new AmazonSqsMessageOptions(exampleAttributes)
  )
);
```

> ⚠️ Don't forget that `messagingRoutingKey` must still be present — it's used to route the message to the correct handler.

---


### Key Features:

* Amazon SQS Integration: Easily send and receive messages with Amazon SQS.

* Local Development Support: Works with ElasticMQ for local development and testing.

* Automatic Queue Creation: Automatically create queues if they don’t exist (when autoCreate: true).

---

## Configuration options

### AmazonSqsChannel

#### **AmazonSqsChannelConfig**
| **Property**              | **Description**                                                                                                                       | **Default Value** |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| **`name`**                | The name of the Amazon SQS channel (e.g., `'message.bus'`).                                                                            |                   |
| **`region`**              | The AWS region for the SQS queue (e.g., `'us-east-1'`).                                                                               |                   |
| **`queueUrl`**            | The URL of the SQS queue (e.g., `'http://localhost:9324/queue/test_queue'`).                                                          |                   |
| **`credentials`**         | AWS credentials for SQS (optional).                                                                                                   |                   |
| **`enableConsumer`**      | Whether to enable message consumption (i.e., processing received messages).                                                           | `true`            |
| **`autoCreate`**          | Automatically create the queue if it doesn’t exist.                                                                                   | `true`            |
| **`maxNumberOfMessages`** | The maximum number of messages to retrieve from the queue in one request.                                                             | 1                 |
| **`visibilityTimeout`**   | The time in seconds that the message will remain invisible to other consumers after being fetched.                                    | 20                |
| **`waitTimeSeconds`**     | The amount of time (in seconds) for long polling. The consumer will wait up to this time for messages.                                | 10                |
| **`deadLetterQueue`**     | When set to `true`, a dead-letter queue (DLQ) is automatically created. The DLQ name follows the pattern: `<queue_name>_dead_letter`. | `false`           |
---

## Real world working example with RabbitMQ & Redis - but might be helpful to understand how it works
https://github.com/nestjstools/messaging-rabbitmq-example
