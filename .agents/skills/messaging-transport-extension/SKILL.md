---
name: messaging-transport-extension
description: Create or extend a transport-adapter package for the NestJS Messaging monorepo. Use when adding a broker, queue, or external delivery mechanism; do not use for application message handlers or ordinary middleware.
---

# Messaging Transport Extension

Build a reliable, independently publishable messaging transport extension that fits the repository's existing discovery and lifecycle model.

## Discover the local contract first

Before editing, inspect the root workspace configuration, the core messaging contracts, and the closest existing adapter. In particular, verify:

- `ChannelConfig`, `Channel`, `IChannelFactory`, `IMessageBus`, `IMessageBusFactory`, and `IMessagingConsumer`.
- The `@ChannelFactory`, `@MessageBusFactory`, and `@MessageConsumer` decorators.
- How `DistributedConsumer` discovers one consumer for each channel type.
- How `ConsumerMessageBus` handles failures and calls `consumer.onError()`.

Choose the closest adapter based on delivery semantics, not merely protocol similarity. Preserve local package conventions for TypeScript, Nest CLI, packaging, release configuration, and test layout.

## Package shape

Create a separate workspace package named `@nestjstools/messaging-<transport>-extension`. It normally contains:

```text
src/
  channel/        config, runtime channel, and channel factory
  message-bus/    outbound bus and bus factory
  consumer/       inbound consumer
  message/        transport-specific dispatch options and envelope types
  messaging-<transport>-extension.module.ts
  index.ts
test/
  unit/
  e2e/
```

The extension module must register its channel factory, message-bus factory, and consumer as Nest providers. Mark it global only when that matches the existing extension modules.

Export only the public module, channel configuration, and message-options types by default. Keep concrete channels, factories, consumers, and broker client details internal unless users need to construct them directly.

## Design the transport boundary

Extend `ChannelConfig` with only transport-level configuration. Keep the inherited channel fields (`name`, middleware, normalizer, consumer enablement, and missing-handler policy) intact.

Validate required configuration and invalid values at construction time. Provide safe defaults only where the transport's normal behavior makes them unsurprising.

The outbound bus must:

1. Reject message options belonging to a different transport.
2. Normalize and transmit the payload supplied by core.
3. Preserve the original `messageRoutingKey` in native metadata or in a small envelope whenever the transport cannot retain it directly.
4. Return only when the selected transport delivery guarantee has been met.

The inbound consumer must reconstruct `ConsumerMessage(payload, routingKey, metadata)` and delegate it to `ConsumerMessageBus`.

Do not assume that `ConsumerMessageBus.dispatch()` rejects on a business-handler failure: it catches errors, invokes `onError()`, and resolves. For transports that need retries, negative acknowledgement, or a failed job, coordinate through `onError()` and make the transport operation fail, nack, retry, or dead-letter explicitly after dispatch returns.

Keep delivery guarantees accurate in code and documentation. Do not claim exactly-once delivery solely because a broker deduplicates or acknowledges a message; handlers can still be invoked more than once across process failures.

## Lifecycle and resource ownership

The channel owns long-lived client connections. Start lazily or at consumer startup as appropriate, make repeated start calls safe, and close clients/workers in `onChannelDestroy()` or the relevant Nest lifecycle hook.

If the transport needs topology or queue creation, make it explicit in configuration. Ensure only the resources required by the selected channel are created, and make initialization idempotent.

## Dependency compatibility

Before adopting a client library, check its current package metadata and runtime module format against this repository's emitted JavaScript. A TypeScript build can succeed while the compiled package fails at runtime when a CommonJS extension imports an ESM-only dependency.

After building, load the compiled extension with Node using the real dependency. If the library is incompatible, choose a compatible supported version or deliberately migrate the package/module format with a documented compatibility plan. Do not hide the issue with a Jest-only mock.

## Tests and integration

Add focused unit tests for:

- Channel configuration validation and defaults.
- Queue/topic/exchange initialization where applicable.
- Outbound envelope and transport-option mapping.
- Inbound payload and routing-key reconstruction.
- Failure behavior that triggers the transport's retry, nack, or dead-letter path.
- Graceful shutdown when the adapter owns a client or worker.

Add a real integration test when a local Docker service or dedicated test environment is available. It should exercise publish, consume, routing-key preservation, and one failure/retry path. Do not claim broker integration was tested if only client mocks were used.

Run the package formatter, build, unit tests, relevant integration tests, root formatting check, and `git diff --check`. Add root workspace build/test scripts and update the core adapter list or documentation when those are maintained in the repository.

## Scope boundaries

Implement the requested adapter first. Keep larger features—transactional outbox, schema registry, dashboards, scheduling, or protocol-specific RPC—as separately named follow-up work unless the user explicitly requests them.
