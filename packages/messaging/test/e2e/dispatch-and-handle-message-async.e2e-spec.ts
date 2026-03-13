import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import {
  DefaultMessageOptions,
  IMessageBus,
  MessageResponse,
  RoutingMessage,
} from '../../src';
import { TestMessage } from '../support/app/test.message';
import { SpyDataService } from '../support/app/spy-data.service';
import { Service } from '../../src/dependency-injection/service';
import { ObjectForwardMessageNormalizer } from '../../src/normalizer/object-forward-message.normalizer';
import { HandlersException } from '../../src/exception/handlers.exception';
import { TestAsyncModule } from '../support/app/test-async.module';

/**
 * @description Same test as DispatchAndHandleMessage but test async loading MessagingModule
 */
describe('DispatchAndHandleMessageAsync', () => {
  let app: INestApplication;
  let defaultMessageBus: IMessageBus;
  let messageBus: IMessageBus;
  let middlewareMessageBus: IMessageBus;
  let spyDataService: SpyDataService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAsyncModule],
    }).compile();
    Logger.overrideLogger(false);

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

  it('will dispatch message to void handler and void second handler and check if everything is correct via spy service', async () => {
    await messageBus.dispatch(
      new RoutingMessage(
        new TestMessage('xyz'),
        'message.void',
        new DefaultMessageOptions([], true, ObjectForwardMessageNormalizer),
      ),
    );

    expect(spyDataService.getFirst()).toBe('xyz');
    expect(spyDataService.getAllData()[1]).toBe('xyz2');
  });

  it('will dispatch message to throwable handler', async () => {
    try {
      await messageBus.dispatch(
        new RoutingMessage(
          new TestMessage('xyz'),
          'message.throwable',
          new DefaultMessageOptions([], true, ObjectForwardMessageNormalizer),
        ),
      );
    } catch (e) {
      expect(e).toBeInstanceOf(HandlersException);
    }
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

    expect(data).toHaveLength(3);
    expect(data[0]).toBe('MIDDLEWARE WORKS');
    expect(data[1]).toBe('xyz');
  });

  it('Dispatch message by DEFAULT MESSAGE BUS and do not show error when handler does not exists', async () => {
    await defaultMessageBus.dispatch(
      new RoutingMessage(
        new TestMessage('xyz'),
        'message_for_not_existed_handler',
      ),
    );
  });
});
