import { IMessageBus } from './i-message-bus.js';
import { Middleware } from '../middleware/middleware.js';
import { SealedRoutingMessage } from '../message/sealed-routing-message.js';
import { DefaultMessageOptions } from '../message/default-message-options.js';
import { ConsumerMessage } from '../consumer/consumer-message.js';
import { Channel } from '../channel/channel.js';
import { MessagingLogger } from '../logger/messaging-logger.js';
import { Log } from '../logger/log.js';
import { IMessagingConsumer } from '../consumer/i-messaging-consumer.js';
import { ConsumerDispatchedMessageError } from '../consumer/consumer-dispatched-message-error.js';
import { HandlersException } from '../exception/handlers.exception.js';
import { ExceptionListenerHandler } from '../exception-listener/exception-listener-handler.js';
import { ExceptionContext } from '../exception-listener/exception-context.js';
import { MessagingLifecycleHookHandler } from '../lifecycle-hook/messaging-lifecycle-hook-handler.js';
import { HookMessage } from '../lifecycle-hook/messaging-lifecycle-hook-listener.js';
import { MessageFactory } from '../message/message.factory.js';

export class ConsumerMessageBus {
  constructor(
    private readonly messageBus: IMessageBus,
    private readonly channel: Channel<any>,
    private readonly logger: MessagingLogger,
    private readonly consumer: IMessagingConsumer<any>,
    private readonly exceptionListenerHandler: ExceptionListenerHandler,
    private readonly messagingHookHandler: MessagingLifecycleHookHandler,
  ) {}

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

      await this.messagingHookHandler.handleOnConsumerHandledMessage(
        HookMessage.fromSealedRoutingMessage(
          routingMessage,
          this.channel.config.name,
          this.channel.constructor.name,
        ),
      );

      await this.messageBus.dispatch(routingMessage);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      await this.consumer.onError(
        new ConsumerDispatchedMessageError(consumerMessage, error),
        this.channel,
      );

      if (!(error instanceof HandlersException)) {
        this.logger.error(
          Log.create(
            `Some error occurred in channel [${this.channel.config.name}]`,
            {
              error: error.message,
              message: JSON.stringify(consumerMessage.message),
              routingKey: consumerMessage.routingKey,
            },
          ),
        );
      }

      await this.exceptionListenerHandler.handleError(
        new ExceptionContext(
          error,
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
