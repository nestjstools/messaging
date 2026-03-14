# Contributing

Thanks for contributing to `@nestjstools/messaging`.

This repository is a monorepo and contains the core package together with multiple transport-specific extensions.

## Packages

Current packages live under `packages/`:

- `messaging`
- `messaging-amazon-sqs-extension`
- `messaging-azure-service-bus-extension`
- `messaging-google-pubsub-extension`
- `messaging-nats-extension`
- `messaging-rabbitmq-extension`
- `messaging-redis-extension`

## Before you start

Please:
- check existing issues and pull requests first
- open an issue before starting bigger changes
- keep pull requests focused on one problem if possible

## Development setup

Clone the repository and install dependencies from the repository root:

* make fork
* git clone https://github.com/nestjstools/messaging.git (your forked repo)
* cd messaging
* yarn install / or npm install

### Branch naming

Push your commits using one of the following branch formats:

- `feat/your-feature-name`
- `fix/your-fix-name`

Example:

feat/add-sqs-batch-processing  
fix/rabbitmq-retry-handling


### Pull request title

PR titles should follow this format:

[name-from-package-dir] feat|chore|fix: short description

Regex used by CI:

`^\[(messaging|messaging-amazon-sqs-extension|messaging-azure-service-bus-extension|messaging-google-pubsub-extension|messaging-nats-extension|messaging-rabbitmq-extension|messaging-redis-extension)\] (feat|chore|fix): .+$`

**Examples:**

* [messaging] feat: add message metadata logging  
* [messaging-rabbitmq-extension] fix: retry handler not triggered  
* [messaging-google-pubsub-extension] feat: support batch publish


### Package version bump

If your change affects a package, please bump the version in the corresponding `package.json`.

Follow semantic versioning:

- **patch** → bug fixes
- **minor** → new features (backwards compatible)
- **major** → breaking changes

Examples:

```bash
1.2.0 → 1.2.1   # fix
1.2.0 → 1.3.0   # feature
1.2.0 → 2.0.0   # breaking change

