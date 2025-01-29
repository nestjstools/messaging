import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../support/app/test.module';
import { IMessageBus, MessageResponse, RoutingMessage } from '../../src';
import { TestMessage } from '../support/app/test.message';
import { SpyDataService } from '../support/app/spy-data.service';
import { Service } from '../../lib/dependency-injection/service';

describe('DispatchAndHandleMessage', () => {
  let app: INestApplication;
  let defaultMessageBus: IMessageBus;
  let messageBus: IMessageBus;
  let middlewareMessageBus: IMessageBus;
  let spyDataService: SpyDataService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    defaultMessageBus = app.get(Service.DEFAULT_MESSAGE_BUS);
    messageBus = app.get('message.bus');
    middlewareMessageBus = app.get('middleware-message.bus');
    spyDataService = app.get(SpyDataService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('will dispatch message to void handler and check if everything is correct via spy service', async () => {
    await messageBus.dispatch(
      new RoutingMessage(new TestMessage('xyz'), 'message.void'),
    );

    expect(spyDataService.getFirst()).toBe('xyz');
  });

  it('will dispatch message to returned handler and expected returned result', async () => {
    const result = await messageBus.dispatch(
      new RoutingMessage(new TestMessage('xyz'), 'message.returned'),
    );

    expect(result).toEqual(
      new MessageResponse([{ id: 'uuid', response: 'xyz' }]),
    );
  });

  it('check if middleware will correctly applied', async () => {
    await middlewareMessageBus.dispatch(
      new RoutingMessage(new TestMessage('xyz'), 'message.void'),
    );
    const data: string[] = spyDataService.getAllData();

    expect(data).toHaveLength(2);
    expect(data[0]).toBe('MIDDLEWARE WORKS');
    expect(data[1]).toBe('xyz');
  });

  it('Dispatch message by DEFAULT MESSAGE BUS and do not show error when handler does not exists', async () => {
    await defaultMessageBus.dispatch(
      new RoutingMessage(new TestMessage('xyz'), 'message_for_not_existed_handler'),
    );
  });
});
