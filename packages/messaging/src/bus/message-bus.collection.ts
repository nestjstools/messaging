import { IMessageBus } from './i-message-bus.js';
import { Channel } from '../channel/channel.js';

export class MessageBusCollection {
  constructor(private collection: Collection[] = []) {}

  add(collection: Collection) {
    this.collection.push(collection);
  }

  getAll(): Collection[] {
    return this.collection;
  }
}

interface Collection {
  messageBus: IMessageBus;
  channel: Channel<any>;
}
