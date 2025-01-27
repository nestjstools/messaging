import {DiscoveryService, ModuleRef} from '@nestjs/core';
import { MessageHandlerRegistry } from '../handler/message-handler.registry';
import { MessagingLogger } from '../logger/messaging-logger';
import { Service } from './service';
import {MESSAGE_HANDLER_METADATA} from "./decorator";

export const registerHandlers = (moduleRef: ModuleRef, discoveryService: DiscoveryService) => {
  const registry: MessageHandlerRegistry = moduleRef.get(Service.MESSAGE_HANDLERS_REGISTRY);
  const logger: MessagingLogger = moduleRef.get(Service.LOGGER);
  const handlerInstances = discoveryService
      .getProviders()
      .filter(handler => {
        if (!handler.metatype) {
          return false;
        }

        return Reflect.hasMetadata(MESSAGE_HANDLER_METADATA, handler.metatype)
      })
      .filter(handler => handler);

  handlerInstances.forEach(handler => {
    logger.log(`Handler [${handler.constructor.name}] was registered`);
    //@ts-ignore
    registry.register(Reflect.getMetadata(MESSAGE_HANDLER_METADATA, handler.metatype), handler.instance);
  })
}
