<p align="center">
  <image src="nestjstools-logo.png" width="400" alt="NestJSTools MQTT Messaging Extension">
</p>

# NestJS MQTT Messaging Extension – Event-Driven Transport for Distributed Systems

### This extension allows you to use **MQTT as a message bus channel**.

An MQTT transport adapter for the **NestJSTools Messaging Library**, enabling lightweight, event-driven communication between NestJS applications, devices, and services.

Designed for:

* IoT devices and edge services
* Event-driven systems
* Telemetry and device-status events
* Cross-language messaging
* MQTT 3.x and MQTT 5 brokers

---

## Documentation

* https://docs.nestjstools.com/messaging
* https://nestjstools.com

---

## Installation

```bash
npm install @nestjstools/messaging @nestjstools/messaging-mqtt-extension
```

or

```bash
yarn add @nestjstools/messaging @nestjstools/messaging-mqtt-extension
```

## MQTT Integration: Messaging Configuration Example

---

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from '@nestjstools/messaging';
import {
  MessagingMqttExtensionModule,
  MqttChannelConfig,
} from '@nestjstools/messaging-mqtt-extension';

@Module({
  imports: [
    MessagingMqttExtensionModule,
    MessagingModule.forRoot({
      buses: [{ name: 'message.bus', channels: ['mqtt-events'] }],
      channels: [
        new MqttChannelConfig({
          name: 'mqtt-events',
          brokerUrl: 'mqtt://localhost:1883',
          clientId: 'orders-service',
          defaultQos: 1,
          enableConsumer: true,
          subscriptions: [
            { topicFilter: 'orders/#' },
          ],
        }),
      ],
      debug: true,
    }),
  ],
})
export class AppModule {}
```

## Dispatch messages via bus (example)

```typescript
import { Controller, Get } from '@nestjs/common';
import {
  IMessageBus,
  MessageBus,
  RoutingMessage,
} from '@nestjstools/messaging';
import { MqttMessageOptions } from '@nestjstools/messaging-mqtt-extension';

@Controller()
export class AppController {
  constructor(
    @MessageBus('message.bus') private readonly messageBus: IMessageBus,
  ) {}

  @Get('/mqtt')
  createOrder(): string {
    void this.messageBus.dispatch(
      new RoutingMessage(
        { orderId: '123' },
        'orders/created',
      ),
    );

    return 'Message sent';
  }
}
```

### Handler for your message

```typescript
import { IMessageHandler, MessageHandler } from '@nestjstools/messaging';

@MessageHandler('orders/created')
export class OrderCreatedHandler implements IMessageHandler<{ orderId: string }> {
  async handle(message: { orderId: string }): Promise<void> {
    console.log(message.orderId);
  }
}
```

---

### Key Features

* **MQTT 3.x and MQTT 5 support** through MQTT.js, including TLS, authentication, reconnect settings, and MQTT 5 publish properties.
* **Named buses and channel routing** for distributing messages across MQTT channels.
* **QoS configuration** per channel, subscription, or individual message.
* **Wildcard subscriptions** with an optional fixed messaging `routingKey`, so MQTT filters such as `devices/+/status` are not passed directly to the handler registry.
* **Retained messages and MQTT 5 properties** through `MqttMessageOptions`.
* **Graceful channel shutdown** closes the MQTT client owned by the channel.

---

## MQTT routing keys and topics

The NestJSTools handler routing key and the MQTT topic can be the same, but they do not have to be.

```typescript
new MqttMessageOptions({ topic: 'orders/events' });
// RoutingMessage routing key remains: 'order.created'
```

The adapter publishes a small JSON envelope containing the payload and original routing key. It lets the consumer route `orders/events` to an `@MessageHandler('order.created')` handler. This is especially useful when several logical message types share a single MQTT topic.

For wildcard subscriptions, set a fixed routing key when one handler should process all matching topics:

```typescript
subscriptions: [
  { topicFilter: 'devices/+/status', routingKey: 'device.status' },
];
```

When `routingKey` is omitted, the concrete received topic, for example `devices/device-17/status`, becomes the handler routing key.

---

## Delivery guarantees

| QoS | Delivery behavior |
| --- | --- |
| `0` | At-most-once delivery. |
| `1` | At-least-once delivery; handlers must tolerate duplicates. |
| `2` | MQTT protocol delivery is exactly once between client and broker; handlers should still be idempotent across application failures. |

MQTT acknowledges a packet before the application handler completes. Therefore, an MQTT broker cannot retry or dead-letter a business-handler failure. Use idempotent handlers and an application-level retry or dead-letter workflow when that behavior is required.

---

## Configuration options

### `MqttChannelConfig`

| Property                                  | Description                                        | Default         |
|-------------------------------------------|----------------------------------------------------|-----------------|
| `name`                                    | Messaging channel name.                            |                 |
| `brokerUrl`                               | MQTT broker URL (`mqtt`, `mqtts`, `ws`, or `wss`). |                 |
| `clientId`                                | MQTT client identifier.                            | MQTT.js default |
| `username`, `password`                    | Optional broker credentials.                       |                 |
| `protocolVersion`                         | MQTT protocol version: `3`, `4`, or `5`.           | `4`             |
| `clean`                                   | Start with a clean MQTT session.                   | `true`          |
| `keepalive`                               | Keepalive interval in seconds.                     | `60`            |
| `reconnectPeriod`                         | Delay between reconnect attempts in milliseconds.  | `1000`          |
| `sessionExpiryInterval`                   | MQTT 5 session expiry interval.                    |                 |
| `subscriptions`                           | Topic filters consumed by the channel.             | `[]`            |
| `defaultQos`                              | Default QoS for publishes and subscriptions.       | `0`             |
| `ca`, `cert`, `key`, `rejectUnauthorized` | TLS configuration for `mqtts` and `wss`.           |                 |
| `enableConsumer`                          | Enable message consumption for this channel.       | `true`          |

### `MqttMessageOptions`

```typescript
new MqttMessageOptions({
  topic: 'orders/events',
  qos: 1,
  retain: false,
  properties: {
    responseTopic: 'orders/replies',
    messageExpiryInterval: 60,
  },
});
```

| Property     | Description                                                                                |
|--------------|--------------------------------------------------------------------------------------------|
| `topic`      | Overrides the MQTT publish topic.                                                          |
| `qos`        | Overrides the channel default QoS.                                                         |
| `retain`     | Retains the message at the broker.                                                         |
| `dup`        | Sets the MQTT duplicate-delivery flag.                                                     |
| `properties` | MQTT 5 publish properties, including response topic, correlation data, and message expiry. |
