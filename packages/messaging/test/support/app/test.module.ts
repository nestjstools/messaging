import { Module } from '@nestjs/common';
import { InMemoryChannelConfig, MessagingModule } from '../../../src.js';
import {
  ReturnedHandler,
  ThrowableHandler,
  VoidHandler,
  VoidSecondHandler,
} from './test.handler.js';
import { SpyDataService } from './spy-data.service.js';
import { TestService } from './test.service.js';
import { SpyDataMiddleware } from './spy-data-middleware.service.js';

@Module({
  imports: [
    MessagingModule.forRoot({
      buses: [
        {
          name: 'message.bus',
          channels: ['simple'],
        },
        {
          name: 'middleware-message.bus',
          channels: ['middleware-simple'],
        },
      ],
      channels: [
        new InMemoryChannelConfig({
          avoidErrorsForNotExistedHandlers: false,
          name: 'simple',
        }),
        new InMemoryChannelConfig({
          avoidErrorsForNotExistedHandlers: false,
          name: 'middleware-simple',
          middlewares: [SpyDataMiddleware],
        }),
      ],
    }),
  ],
  providers: [
    SpyDataMiddleware,
    ReturnedHandler,
    ThrowableHandler,
    VoidHandler,
    VoidSecondHandler,
    SpyDataService,
    TestService,
  ],
})
export class TestModule {}
