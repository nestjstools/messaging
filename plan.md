# Messaging Extensions Implementation Plan

This plan covers the following extensions, in implementation order:

1. Kafka
2. PostgreSQL queue
3. MQTT

## Shared foundation

Before implementing the transports:

- Create a reusable transport contract-test suite.
- Standardize message envelopes: payload, routing key, headers, timestamp, and message ID.
- Define consistent acknowledgement behavior:
  - Success: acknowledge or commit.
  - Handler failure: retry or reject.
  - Malformed message: invoke the error listener or send to a dead-letter queue.
- Test normalization, middleware, lifecycle hooks, disabled consumers, and graceful shutdown.
- Add workspace build and test scripts for every new package.

Each package should follow this structure:

```text
src/
  channel/
    *.channel-config.ts
    *.channel.ts
    *.channel-factory.ts
  consumer/
    *-messaging.consumer.ts
  message/
    *-message-options.ts
  message-bus/
    *-message.bus.ts
    *-message-bus-factory.ts
  messaging-*-extension.module.ts
  index.ts
test/
  unit/
  e2e/
```

## Phase 1: Kafka extension

Package: `@nestjstools/messaging-kafka-extension`

### API design

Create:

- `KafkaChannelConfig`
- `KafkaChannel`
- `KafkaChannelFactory`
- `KafkaMessageBus`
- `KafkaMessageBusFactory`
- `KafkaMessagingConsumer`
- `KafkaMessageOptions`
- `MessagingKafkaExtensionModule`

Configuration should include:

- Brokers
- Client ID
- Consumer group ID
- Subscribed topics
- SSL/SASL settings
- Consumer concurrency
- `fromBeginning`
- Automatic or manual offset commits
- Producer idempotence
- Topic auto-creation policy

Message options should support:

- Topic override
- Partition key
- Explicit partition
- Headers
- Timestamp

### Important decisions

- Use the message routing key as the default Kafka topic, with `KafkaMessageOptions.topic` as an override.
- Store the original routing key in Kafka headers when the topic differs from it.
- Commit offsets only after `ConsumerMessageBus.dispatch()` succeeds.
- Do not commit the offset after handler failure.
- Preserve ordering inside a partition.
- Start with one-message processing and add batch handling later.

Run a client-library spike first. Confluent's maintained JavaScript client provides a promise API and KafkaJS-compatible interface, but uses `librdkafka` and describes Yarn support as experimental. This matters because the repository uses Yarn 4.

Reference: <https://github.com/confluentinc/confluent-kafka-javascript>

### Tests

- Produce and consume
- Partition-key ordering
- Headers and routing-key preservation
- Successful offset commit
- No commit after handler failure
- Consumer-group distribution
- SASL configuration validation
- Reconnection and graceful shutdown

Use Kafka in Docker for integration tests.

## Phase 2: PostgreSQL extension

Package: `@nestjstools/messaging-postgres-extension`

Use `pg-boss` for the first version. It provides PostgreSQL locking, workers, retries, dead-letter queues, scheduling, and transaction integration.

Reference: <https://pgboss.io/>

### API design

Create:

- `PostgresChannelConfig`
- `PostgresChannel`
- `PostgresChannelFactory`
- `PostgresMessageBus`
- `PostgresMessageBusFactory`
- `PostgresMessagingConsumer`
- `PostgresMessageOptions`
- `MessagingPostgresExtensionModule`

Configuration should include:

- Connection string or supplied database adapter
- Schema
- Queue name
- Worker concurrency
- Polling interval
- Batch size
- Automatic queue creation
- Retry limit and backoff
- Retention policy
- Expiration timeout
- Dead-letter queue

Message options should support:

- Queue override
- Priority
- Start-after delay
- Expiration
- Singleton or deduplication key
- Retry overrides

### Important decisions

- Treat this initially as a PostgreSQL job queue, not as a transactional outbox.
- Default to one configured queue per channel.
- Store the messaging routing key inside the job data.
- Complete a job only after handler success.
- Let failed jobs follow the configured retry and dead-letter policy.
- Allow an existing pool or adapter to be supplied so applications can control connections.

Transactional outbox support should be a separate milestone. The current `IMessageBus.dispatch()` API has no transaction argument, so true application-transaction integration needs either:

- A transaction handle in `PostgresMessageOptions`; or
- A separate `TransactionalPostgresMessageBus` API.

Do not describe the extension as an outbox until it provides this atomic transaction integration.

### Tests

- Queue creation and schema isolation
- Produce and consume
- Concurrent workers process a job once
- Retry and backoff
- Dead-letter behavior
- Delayed and priority jobs
- Deduplication
- PostgreSQL restart recovery
- Graceful worker shutdown
- Transaction rollback does not enqueue a job

Use PostgreSQL in Docker for integration tests.

## Phase 3: MQTT extension

Package: `@nestjstools/messaging-mqtt-extension`

Use MQTT.js, which supports MQTT 3.x/5, QoS, reconnection, TLS, and asynchronous publishing and subscribing.

Reference: <https://github.com/mqttjs/MQTT.js>

### API design

Create:

- `MqttChannelConfig`
- `MqttChannel`
- `MqttChannelFactory`
- `MqttMessageBus`
- `MqttMessageBusFactory`
- `MqttMessagingConsumer`
- `MqttMessageOptions`
- `MessagingMqttExtensionModule`

Configuration should include:

- Broker URL
- Client ID
- Username and password
- TLS configuration
- Protocol version
- Clean session
- Keepalive
- Reconnect period
- Subscriptions
- Default QoS
- Session-expiry settings

Represent subscriptions as:

```typescript
interface MqttSubscription {
  topicFilter: string;
  qos?: 0 | 1 | 2;
  routingKey?: string;
}
```

Message options should support:

- Topic override
- QoS
- Retain
- Duplicate flag
- MQTT 5 properties
- Message expiry
- Response topic
- Correlation data

### Important decisions

The core handler registry uses exact routing keys, while MQTT subscriptions can contain `+` and `#` wildcards. Therefore:

- If a subscription defines `routingKey`, dispatch all matching MQTT messages to that fixed routing key.
- Otherwise, use the concrete received topic as the routing key.
- Do not pass a wildcard such as `devices/+/status` directly to the handler registry.

Delivery behavior:

- QoS 0: accept at-most-once delivery.
- QoS 1: handlers must tolerate duplicates.
- QoS 2: rely on the broker/client protocol guarantee while still recommending idempotent handlers.

### Tests

- Publish and subscribe
- QoS 0, 1, and 2
- Wildcard subscription mapping
- Retained messages
- MQTT 5 properties
- TLS and authentication configuration
- Persistent-session reconnect
- Duplicate delivery behavior
- Graceful disconnect

Use Eclipse Mosquitto in Docker for integration tests.

## Recommended delivery order

1. Build the shared contract-test harness.
2. Implement the Kafka MVP.
3. Stabilize Kafka through integration tests.
4. Implement the PostgreSQL queue MVP.
5. Add transactional enqueue as a separate milestone.
6. Implement the MQTT MVP.
7. Run the same contract suite against all existing and new transports.
8. Add examples, README documentation, and root workspace scripts.

## Scope boundary

Kafka, PostgreSQL queue, and MQTT should first ship as reliable transport adapters. Schema Registry, transactional outbox, Kafka batch consumption, and advanced MQTT request/response should remain follow-up milestones.
