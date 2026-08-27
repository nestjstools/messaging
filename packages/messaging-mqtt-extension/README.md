# NestJS MQTT Messaging Extension

`@nestjstools/messaging-mqtt-extension` connects `@nestjstools/messaging` channels to an MQTT 3.x/5 broker through MQTT.js.

## Install

```bash
npm install @nestjstools/messaging @nestjstools/messaging-mqtt-extension mqtt
```

Import `MessagingMqttExtensionModule`, then configure a `MqttChannelConfig` in `MessagingModule`.

```ts
new MqttChannelConfig({
  name: 'mqtt',
  brokerUrl: 'mqtt://localhost:1883',
  defaultQos: 1,
  subscriptions: [{ topicFilter: 'devices/+/status', routingKey: 'device.status' }],
})
```

MQTT wildcard filters are never used as handler keys: set `routingKey` for wildcard subscriptions, otherwise the concrete received topic is used. Outbound messages carry a small JSON envelope so the original messaging routing key survives topic overrides.

QoS 0 is at-most-once. QoS 1 can be duplicated and QoS 2 still requires idempotent handlers. MQTT acknowledges packets before an application handler completes, so MQTT itself cannot retry or dead-letter a handler failure; use an idempotent handler plus an application-level retry/dead-letter workflow where required.
