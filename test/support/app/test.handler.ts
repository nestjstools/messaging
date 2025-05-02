import { IMessageHandler, MessageHandler } from '../../../src';
import { Injectable } from '@nestjs/common';
import { TestMessage } from './test.message';
import { TestService } from './test.service';

@Injectable()
@MessageHandler('message.void')
export class VoidHandler implements IMessageHandler<TestMessage> {
  constructor(private readonly testService: TestService) {}

  handle(message: TestMessage): Promise<object | void> {
    this.testService.markAsDone(message.name);

    return Promise.resolve();
  }
}

@Injectable()
@MessageHandler('message.void')
export class VoidSecondHandler implements IMessageHandler<TestMessage> {
  constructor(private readonly testService: TestService) {}

  handle(message: TestMessage): Promise<object | void> {
    return Promise.resolve();
  }
}

@Injectable()
@MessageHandler('message.returned')
export class ReturnedHandler implements IMessageHandler<TestMessage> {
  handle(message: TestMessage): Promise<object | void> {
    return Promise.resolve(new ReturnedHandlerResponse('uuid', message.name));
  }
}

class ReturnedHandlerResponse {
  constructor(
    public readonly id: string,
    public readonly response: string,
  ) {}
}
