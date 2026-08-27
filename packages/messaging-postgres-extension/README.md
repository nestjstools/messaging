# NestJS Messaging PostgreSQL Extension

PostgreSQL queue adapter for `@nestjstools/messaging`, powered by `pg-boss`.

## Installation

```bash
yarn add @nestjstools/messaging @nestjstools/messaging-postgres-extension
```

## Usage

```typescript
import { Module } from '@nestjs/common';
import {
  MessagingModule,
  RoutingMessage,
} from '@nestjstools/messaging';
import {
  MessagingPostgresExtensionModule,
  PostgresChannelConfig,
} from '@nestjstools/messaging-postgres-extension';

@Module({
  imports: [
    MessagingPostgresExtensionModule,
    MessagingModule.forRoot({
      channels: [
        new PostgresChannelConfig({
          name: 'jobs',
          connectionString: process.env.DATABASE_URL!,
          queue: 'application-jobs',
          queuePolicy: { retryLimit: 3, retryBackoff: true },
        }),
      ],
      buses: [{ name: 'jobs.bus', channels: ['jobs'] }],
    }),
  ],
})
export class AppModule {}
```

Messages use the configured queue by default. The original messaging routing key is stored in the PostgreSQL job payload and is restored before the message reaches a `@MessageHandler()`.

This initial release is a durable PostgreSQL queue adapter. Transactional outbox support is intentionally out of scope.
