import { Observable, Subject } from 'rxjs';
import { ConsumerMessage } from './consumer-message';
import { ConsumerMessageDispatcher } from './consumer-message-dispatcher';

export class ConsumerMessageMediator implements ConsumerMessageDispatcher {
  private $message: Subject<ConsumerMessage> = new Subject();

  constructor() {}

  dispatch(message: ConsumerMessage): void {
    this.$message.next(message);
  }

  listen(): Observable<ConsumerMessage> {
    return this.$message.asObservable();
  }
}
