import { Module } from '@nestjs/common';
import { InMemoryChannelConfig, MessagingModule } from '../../../src';
import { ReturnedHandler, VoidHandler } from './test.handler';
import { SpyDataService } from './spy-data.service';
import { TestService } from './test.service';
import { SpyDataMiddleware } from './spy-data-middleware.service';

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
          middlewares: [],
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
    VoidHandler,
    SpyDataService,
    TestService,
  ],
})
export class TestModule {}
