import { IMessageBus } from './i-message-bus';
import { Middleware } from '../middleware/middleware';
import { SealedRoutingMessage } from '../message/sealed-routing-message';
import { DefaultMessageOptions } from '../message/default-message-options';
import { ConsumerMessage } from '../consumer/consumer-message';
import { Channel } from '../channel/channel';
import { MessagingLogger } from '../logger/messaging-logger';
import { Log } from '../logger/log';
import { IMessagingConsumer } from '../consumer/i-messaging-consumer';
import { ConsumerDispatchedMessageError } from '../consumer/consumer-dispatched-message-error';
import { HandlersException } from '../exception/handlers.exception';
import { ExceptionListenerHandler } from '../exception-listener/exception-listener-handler';
import { ExceptionContext } from '../exception-listener/exception-context';
import { MessagingLifecycleHookHandler } from '../lifecycle-hook/messaging-lifecycle-hook-handler';
import { HookMessage } from '../lifecycle-hook/messaging-lifecycle-hook-listener';
import { MessageFactory } from '../message/message.factory';

export class ConsumerMessageBus {
  constructor(
    private readonly messageBus: IMessageBus,
    private readonly channel: Channel<any>,
    private readonly logger: MessagingLogger,
    private readonly consumer: IMessagingConsumer<any>,
    private readonly exceptionListenerHandler: ExceptionListenerHandler,
    private readonly messagingHookHandler: MessagingLifecycleHookHandler,
  ) {
  }

  async dispatch(consumerMessage: ConsumerMessage): Promise<void> {
    try {
      this.logger.debug(
        Log.create(
          `[${this.channel.config.name}] Message handled with routing key: [${consumerMessage.routingKey}]`,
          {
            message: JSON.stringify(consumerMessage.message),
          },
        ),
      );

      const middlewares: Middleware[] = this.channel.config
        .middlewares as Middleware[];

      const routingMessage = new SealedRoutingMessage(
        consumerMessage.message,
        consumerMessage.routingKey,
      ).createWithOptions(
        new DefaultMessageOptions(
          middlewares,
          this.channel.config?.avoidErrorsForNotExistedHandlers ?? true,
          this.channel.config.normalizer,
        ),
      );

      await this.messagingHookHandler.handleAfterMessageDenormalized(
        HookMessage.fromSealedRoutingMessage(
          routingMessage,
          this.channel.config.name,
          this.channel.constructor.name,
        ),
      );

      await this.messageBus.dispatch(routingMessage);
    } catch (e) {
      await this.consumer.onError(
        new ConsumerDispatchedMessageError(consumerMessage, e),
        this.channel,
      );

      if (!(e instanceof HandlersException)) {
        this.logger.error(
          Log.create(
            `Some error occurred in channel [${this.channel.config.name}]`,
            {
              error: e instanceof Error ? e.message : String(e),
              message: JSON.stringify(consumerMessage.message),
              routingKey: consumerMessage.routingKey,
            },
          ),
        );
      }

      await this.exceptionListenerHandler.handleError(
        new ExceptionContext(
          e,
          this.channel.config.name,
          consumerMessage.message,
          consumerMessage.routingKey,
        ),
      );

      await this.messagingHookHandler.handleOnFailedMessageConsumer(
        HookMessage.fromConsumerMessage(
          consumerMessage,
          this.channel.config.name,
          this.channel.constructor.name,
        ),
      );
    }

    return Promise.resolve();
  }
}
