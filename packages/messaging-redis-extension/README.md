<p align="center">
  <img src="nestjstools-logo.png" width="400" alt="NestJSTools Messaging Redis Extension for NestJS">
</p>

# NestJS Redis Messaging Extension

## `@nestjstools/messaging-redis-extension`

A powerful **Redis messaging extension for NestJS** built on top of `@nestjstools/messaging`.

This library enables **asynchronous and synchronous messaging**, supporting:

* Message buses
* Channels
* Consumers
* Distributed communication
* Scalable microservices architecture

It helps you build **decoupled, event-driven, and production-ready NestJS applications** using Redis as a transport layer.

---
## Documentation

* https://docs.nestjstools.com/messaging
* https://nestjstools.com

---

## Installation

```bash
npm install @nestjstools/messaging @nestjstools/messaging-redis-extension 
```

or

```bash
yarn add @nestjstools/messaging @nestjstools/messaging-redis-extension
```
## Redis Integration: Messaging Configuration Example

---

```typescript
import {MessagingModule} from '@nestjstools/messaging';
import {SendMessageHandler} from './handlers/send-message.handler';
import {MessagingRedisExtensionModule, RedisChannelConfig} from '@nestjstools/messaging-redis-extension';

@Module({
   imports: [
      MessagingRedisExtensionModule,
      MessagingModule.forRoot({
         buses: [
            {
               name: 'message.bus',
               channels: ['my-channel'],
            },
            {
               name: 'command.bus', //The naming is very flexible
               channels: ['redis-command'], //be sure if you defined same channels name as you defined below, you can bind multiple channels there, like send message to rabbitmq and redis at the same time 
            },
            {
               name: 'event.bus',
               channels: ['redis-event'],
            },
         ],
         channels: [
            new InMemoryChannelConfig({
               name: 'my-channel',
               middlewares: [],
               avoidErrorsForNotExistedHandlers: true,
            }),
            new RedisChannelConfig({
               name: 'redis-command',
               middlewares: [],
               avoidErrorsForNotExistedHandlers: false,
               queue: 'command-queue',
               connection: {
                  port: 6379,
                  host: '127.0.0.1',
               },
            }),
            new RedisChannelConfig({
               name: 'redis-event',
               middlewares: [],
               avoidErrorsForNotExistedHandlers: true,
               queue: 'event-queue',
               connection: {
                  port: 6379,
                  host: '127.0.0.1',
               },
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

### Key Features:

1. **Multiple Message Buses**:
   - Configure distinct buses for **commands**, and **events**:
      - `command.bus` (command processing).
      - `event.bus` (event processing).

2. **In-Memory Channel**:
   - Simple and lightweight channel suitable for non-persistent messaging or testing purposes.

3. **Redis Channels**:
   - Fully integrated Redis configuration using `RedisChannelConfig`.

4. **Channel Details**:
   - `connection`: Specifies the Redis server connection.
   - `queue`: Specify a Redis queue name to consume messages from.

5. **Error Handling**:
   - Use `avoidErrorsForNotExistedHandlers` in `redis-event` to gracefully handle missing handlers for event messages.

6. **Debug Mode**:
   - Enable `debug: true` to assist in monitoring and troubleshooting messages.

This configuration provides a solid foundation for integrating redis as part of your messaging system. It facilitates the decoupling of commands, events, and in-memory operations, ensuring reliable and scalable communication across distributed systems.

---

## Configuration options

### RedisChannel

#### **RedisChannelConfig**

| **Property**                           | **Description**                                                      | **Default Value** |
|----------------------------------------|----------------------------------------------------------------------|-------------------|
| **`name`**                             | Name of the Redis channel (e.g., `'redis-command'`).                 |                   |
| **`connection`**                       | Redis connection configuration (host, port, password, db).           |                   |
| **`queue`**                            | The Redis queue to consume messages from (e.g., `'my_app.command'`). |                   |
| **`enableConsumer`**                   | Enables or disables the consumer for this channel.                   | `true`            |
| **`avoidErrorsForNotExistedHandlers`** | Avoid errors if no handler is available for the message.             | `false`           |
| **`keyPrefix`**                        | Optional prefix for keys stored in Redis.                            |                   |

---

## Real world working example with RabbitMQ & Redis
https://github.com/nestjstools/messaging-rabbitmq-example

## Keywords
nestjs messaging library, nestjs message bus, nestjs service bus, nestjs distributed systems, nestjs microservices messaging
