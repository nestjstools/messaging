import { Inject } from '@nestjs/common';
import { Service } from './service.js';

export const MessageBus = (busName) => Inject(busName);

export const DefaultMessageBus = () => Inject(Service.DEFAULT_MESSAGE_BUS);
