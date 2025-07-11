import { Module } from '@nestjs/common';
import { InMemoryChannelConfig, MessagingModule } from '../../../src';
import { ReturnedHandler, ThrowableHandler, VoidHandler, VoidSecondHandler } from './test.handler';
import { SpyDataService } from './spy-data.service';
import { TestService } from './test.service';
import { SpyDataMiddleware } from './spy-data-middleware.service';

@Module({
  imports: [
    MessagingModule.forRootAsync({
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
      useChannelFactory: () => {
        return [
            new InMemoryChannelConfig({
              avoidErrorsForNotExistedHandlers: false,
              name: 'simple',
            }),
            new InMemoryChannelConfig({
              avoidErrorsForNotExistedHandlers: false,
              name: 'middleware-simple',
              middlewares: [SpyDataMiddleware],
            }),
        ];
      }
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
export class TestAsyncModule {}
