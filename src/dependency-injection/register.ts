import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { MessagingLogger } from '../logger/messaging-logger';
import { Service } from './service';
import {
  MESSAGE_HANDLER_METADATA,
  MESSAGING_MIDDLEWARE_METADATA,
} from './decorator';
import { MiddlewareRegistry } from '../middleware/middleware.registry';

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
    logger.log(`Handler [${handler.name}] was registered`);
    registry.register(
      Reflect.getMetadata(MESSAGE_HANDLER_METADATA, handler.metatype),
      handler.instance,
    );
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
    logger.log(`Middleware [${middleware.name}] was registered`);
    registry.register(
      Reflect.getMetadata(MESSAGING_MIDDLEWARE_METADATA, middleware.metatype),
      middleware.instance,
    );
  });
};
