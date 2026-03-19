import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { MessagingLogger } from '../logger/messaging-logger';
import { Service } from './service';
import {
  MESSAGE_HANDLER_METADATA,
  MESSAGING_EXCEPTION_LISTENER_METADATA,
  MESSAGING_LIFECYCLE_HOOK_METADATA,
  MESSAGING_MIDDLEWARE_METADATA,
  MESSAGING_NORMALIZER_METADATA,
} from './decorator';
import { DEFAULT_MIDDLEWARE, DEFAULT_NORMALIZER } from '../const';
import { Registry } from '../shared/registry';
import { MiddlewareRegistry } from '../middleware/middleware.registry';
import { ExceptionListenerRegistry } from '../exception-listener/exception-listener.registry';
import { NormalizerRegistry } from '../normalizer/normalizer.registry';
import { MessagingLifecycleHookRegistry } from '../lifecycle-hook/messaging-lifecycle-hook.registry';

export const registerHandlers = (
  moduleRef: ModuleRef,
  discoveryService: DiscoveryService,
) => {
  const registry: MessageHandlerRegistry = moduleRef.get(
    Service.MESSAGE_HANDLERS_REGISTRY,
  );
  const logger: MessagingLogger = moduleRef.get(Service.LOGGER);
  const handlerInstances = discoveryService.getProviders().filter((handler) => {
    if (!handler.metatype) {
      return false;
    }

    return Reflect.hasMetadata(MESSAGE_HANDLER_METADATA, handler.metatype);
  });

  handlerInstances.forEach((handler) => {
    registry.register(
      Reflect.getMetadata(MESSAGE_HANDLER_METADATA, handler.metatype),
      handler.instance,
    );
    logger.log(`Handler [${handler.name}] was registered`);
  });
};

export const registerMiddlewares = (
  moduleRef: ModuleRef,
  discoveryService: DiscoveryService,
) => {
  register<MiddlewareRegistry>(
    moduleRef,
    discoveryService,
    Service.MIDDLEWARE_REGISTRY,
    MESSAGING_MIDDLEWARE_METADATA,
    'Middleware',
  );
};

export const registerMessageNormalizers = (
  moduleRef: ModuleRef,
  discoveryService: DiscoveryService,
) => {
  register<NormalizerRegistry>(
    moduleRef,
    discoveryService,
    Service.MESSAGE_NORMALIZERS_REGISTRY,
    MESSAGING_NORMALIZER_METADATA,
    'MessageNormalizer',
  );
};

export const registerExceptionListener = (
  moduleRef: ModuleRef,
  discoveryService: DiscoveryService,
) => {
  register<ExceptionListenerRegistry>(
    moduleRef,
    discoveryService,
    Service.EXCEPTION_LISTENER_REGISTRY,
    MESSAGING_EXCEPTION_LISTENER_METADATA,
    'ExceptionListener',
  );
};

export const registerMessagingHooks = (
  moduleRef: ModuleRef,
  discoveryService: DiscoveryService,
) => {
  register<MessagingLifecycleHookRegistry>(
    moduleRef,
    discoveryService,
    MessagingLifecycleHookRegistry,
    MESSAGING_LIFECYCLE_HOOK_METADATA,
    'MessagingLifecycleHook',
  );
};

const register = <T extends Registry<object>>(
  moduleRef: ModuleRef,
  discoveryService: DiscoveryService,
  registryProvider:
    | string
    | symbol
    | (abstract new (...args: unknown[]) => unknown),
  decoratorMetadata: string,
  name: string,
) => {
  const exceptions = [DEFAULT_NORMALIZER, DEFAULT_MIDDLEWARE];
  const registry: Registry<T> = moduleRef.get(registryProvider);
  const logger: MessagingLogger = moduleRef.get(Service.LOGGER);
  const instances = discoveryService.getProviders().filter((provider) => {
    if (!provider.metatype) {
      return false;
    }

    return Reflect.hasMetadata(decoratorMetadata, provider.metatype);
  });

  instances.forEach((provider) => {
    registry.register(
      Reflect.getMetadata(decoratorMetadata, provider.metatype),
      provider.instance,
    );
    if (!exceptions.includes(provider.name)) {
      logger.log(`${name} [${provider.name}] was registered`);
    }
  });
};
