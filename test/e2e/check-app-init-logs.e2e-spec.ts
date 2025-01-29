import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { TestModule } from '../support/app/test.module';
import { SpyLogger } from '../support/logger/spy.logger';
import { Service } from '../../lib/dependency-injection/service';

describe('CheckAppInitLogs', () => {
  let app: INestApplication;
  let logger: SpyLogger;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    })
      .overrideProvider(Service.LOGGER)
      .useValue(new SpyLogger(new Logger(), true, true))
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger = app.get(Service.LOGGER);
  });

  afterAll(async () => {
    await app.close();
  });

  it('will check logs when app is initialized', async () => {
    const logs = logger.getLogs();

    expect(logs).toEqual([
      { type: 'LOG', content: 'Channel [simple] was registered' },
      {
        type: 'LOG',
        content: 'Channel [middleware-simple] was registered',
      },
      {
        type: 'LOG',
        content: 'MessageBus [message.bus] was created successfully',
      },
      {
        type: 'LOG',
        content: 'MessageBus [middleware-message.bus] was created successfully',
      },
      { type: 'LOG', content: 'Handler [ReturnedHandler] was registered' },
      { type: 'LOG', content: 'Handler [VoidHandler] was registered' },
      {
        type: 'LOG',
        content: 'Middleware [SpyDataMiddleware] was registered',
      },
    ]);
  });
});
