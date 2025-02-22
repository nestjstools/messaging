import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { MessagingLogger } from '../logger/messaging-logger';
import { Service } from './service';
import {
  MESSAGE_HANDLER_METADATA,
  MESSAGING_MIDDLEWARE_METADATA, MESSAGING_NORMALIZER_METADATA,
} from './decorator';
import { MiddlewareRegistry } from '../middleware/middleware.registry';
import { NormalizerRegistry } from '../normalizer/normalizer.registry';
import { DEFAULT_MIDDLEWARE, DEFAULT_NORMALIZER } from '../const';

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
  const registry: MiddlewareRegistry = moduleRef.get(
    Service.MIDDLEWARE_REGISTRY,
  );
  const logger: MessagingLogger = moduleRef.get(Service.LOGGER);
  const middlewareInstances = discoveryService
    .getProviders()
    .filter((middleware) => {
      if (!middleware.metatype) {
        return false;
      }

      return Reflect.hasMetadata(
        MESSAGING_MIDDLEWARE_METADATA,
        middleware.metatype,
      );
    });

  middlewareInstances.forEach((middleware) => {
    registry.register(
      Reflect.getMetadata(MESSAGING_MIDDLEWARE_METADATA, middleware.metatype),
      middleware.instance,
    );
    if (middleware.name !== DEFAULT_MIDDLEWARE) {
      logger.log(`Middleware [${middleware.name}] was registered`);
    }
  });
};

export const registerMessageNormalizers = (
  moduleRef: ModuleRef,
  discoveryService: DiscoveryService,
) => {
  const registry: NormalizerRegistry = moduleRef.get(
    Service.MESSAGE_NORMALIZERS_REGISTRY,
  );
  const logger: MessagingLogger = moduleRef.get(Service.LOGGER);
  const messageNormalizerInstances = discoveryService
    .getProviders()
    .filter((messageNormalizer) => {
      if (!messageNormalizer.metatype) {
        return false;
      }

      return Reflect.hasMetadata(
        MESSAGING_NORMALIZER_METADATA,
        messageNormalizer.metatype,
      );
    });

  messageNormalizerInstances.forEach((messageNormalizer) => {
    registry.register(
      Reflect.getMetadata(MESSAGING_NORMALIZER_METADATA, messageNormalizer.metatype),
      messageNormalizer.instance,
    );
    if (messageNormalizer.name !== DEFAULT_NORMALIZER) {
      logger.log(`MessageNormalizer [${messageNormalizer.name}] was registered`);
    }
  });
};
