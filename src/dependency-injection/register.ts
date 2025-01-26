import { ModuleRef } from '@nestjs/core';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { MessagingLogger } from '../logger/messaging-logger';
import { Service } from './service';

export const registerHandlers = (moduleRef: ModuleRef) => {
  const registry: MessageHandlerRegistry = moduleRef.get(
    Service.MESSAGE_HANDLERS_REGISTRY,
  );
  const logger: MessagingLogger = moduleRef.get(Service.LOGGER);
  moduleRef.get(Service.MESSAGE_HANDLERS).forEach((handler) => {
    logger.log(`Handler [${handler.name}] was registered`);
    registry.register(handler);
  });
};
