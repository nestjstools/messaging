<p align="center">
    <image src="nestjstools-logo.png" width="400">
</p>

# @nestjstools/messaging-azure-service-bus-extension

A NestJS library for managing asynchronous and synchronous messages with support for buses, handlers, channels, and consumers. This library simplifies building scalable and decoupled applications by facilitating robust message handling pipelines while ensuring flexibility and reliability.

---

## Documentation

https://nestjstools.gitbook.io/nestjstools-messaging-docs

---

## Installation

```bash
npm install @nestjstools/messaging @nestjstools/messaging-azure-service-bus-extension 
```

or

```bash
yarn add @nestjstools/messaging @nestjstools/messaging-azure-service-bus-extension
```
## Azure service bus Integration: Messaging Configuration Example

---

### Basic Example (Queue Mode)

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from '@nestjstools/messaging';
import { SendMessageHandler } from './handlers/send-message.handler';
import { MessagingAzureServiceBusExtensionModule, AzureServiceBusChannelConfig } from '@nestjstools/messaging-azure-service-bus-extension';

@Module({
  imports: [
    MessagingAzureServiceBusExtensionModule,
    MessagingModule.forRoot({
      buses: [
         {
            name: 'azure.bus',
            channels: ['azure-channel'],
         },
      ],
       channels: [
          new AzureServiceBusChannelConfig({
             name: 'azure-channel',
             autoCreate: false, // Requires admin access in Azure to auto-create resources
             enableConsumer: true, // Needed for `autoCreate` and message consumption
             connectionString: 'Endpoint=...SharedAccessKey=...',
             queue: 'azure-queue',
             // mode: Mode.QUEUE, // Optional: default is 'QUEUE'
          }),
       ],
      debug: true, // Optional: Enable debugging for Messaging operations
    }),
  ],
})
export class AppModule {}
```

### Topic/Subscription Mode (Pub/Sub)

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from '@nestjstools/messaging';
import { SendMessageHandler } from './handlers/send-message.handler';
import { MessagingAzureServiceBusExtensionModule, AzureServiceBusChannelConfig } from '@nestjstools/messaging-azure-service-bus-extension';

@Module({
  imports: [
    MessagingAzureServiceBusExtensionModule,
    MessagingModule.forRoot({
      buses: [
         {
            name: 'azure.bus',
            channels: ['azure-channel'],
         },
      ],
       channels: [
          new AzureServiceBusChannelConfig({
             name: 'azure-pubsub-channel',
             autoCreate: true, // Automatically create topic and subscription (if they don’t exist)
             enableConsumer: true, // Needed for `autoCreate` and message consumption
             connectionString: 'Endpoint=...SharedAccessKey=...',
             topic: 'azure-topic',
             subscription: 'azure-subscription',
             mode: Mode.TOPIC,
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
    @MessageBus('azure.bus') private azureMessageBus: IMessageBus,
  ) {}

  @Get('/azure')
  createUser(): string {
    this.azureMessageBus.dispatch(new RoutingMessage(new CreateUser('John FROM Azure bus'), 'my_app_command.create_user'));

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

* **Azure service bus Integration** Seamlessly send and receive messages using Azure service bus within your NestJS application.

* **Automatic Queue Creation** Automatically creates when autoCreate: true is set in the configuration.

* **Named Buses & Channel Routing** Supports custom-named message buses and routing of messages across multiple channels for event-driven architecture.

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

---

## Configuration options

### AzureServiceBusChannel

#### **AzureServiceBusChannelConfig**

| **Property**                           | **Description**                                                                                            | **Default Value** |
|----------------------------------------|------------------------------------------------------------------------------------------------------------|-------------------|
| **`name`**                             | The name of the messaging channel within your app (used for internal routing).                             |                   |
| **`connectionString`**                 | Full Azure Service Bus connection string (`Endpoint=sb://...;SharedAccessKeyName=...;...`).                |                   |
| **`mode`**                             | Messaging mode: `'queue'` (point-to-point) or `'topic'` (publish-subscribe).                               | `Mode.QUEUE`      |
| **`queue`**                            | The queue name (used in `Mode.QUEUE`).                                                                     |                   |
| **`topic`**                            | The topic name (used in `Mode.TOPIC`).                                                                     |                   |
| **`subscription`**                     | The subscription name under the topic (required when `mode` is `TOPIC`).                                   |                   |
| **`enableConsumer`**                   | Whether to enable message consumption (subscribe and process messages).                                    | `true`            |
| **`autoCreate`**                       | Automatically create the queue/topic/subscription if not found. Requires Service Bus **admin privileges**. | `false`           |
| **`middlewares`**                      | Optional array of middleware functions for pre-processing incoming messages.                               | `[]`              |
| **`avoidErrorsForNotExistedHandlers`** | Ignore errors when a routing key doesn’t match any registered handler.                                     | `false`           |


### Real world working example with RabbitMQ & Redis - but might be helpful to understand how it works
https://github.com/nestjstools/messaging-rabbitmq-example
