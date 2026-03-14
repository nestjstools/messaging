import { ChannelConfig } from '@nestjstools/messaging';

export class AmazonSqsChannelConfig extends ChannelConfig {
  public readonly credentials?: Credentials;
  public readonly queueUrl: string;
  public readonly queueName?: string;
  public readonly endpoint?: string;
  public readonly region: string;
  public readonly maxNumberOfMessages?: number;
  public readonly visibilityTimeout?: number;
  public readonly waitTimeSeconds?: number;
  public readonly autoCreate?: boolean;
  public readonly deadLetterQueue?: boolean;

  constructor({
    name,
    credentials,
    queueUrl,
    maxNumberOfMessages,
    visibilityTimeout,
    waitTimeSeconds,
    region,
    autoCreate,
    deadLetterQueue,
    enableConsumer,
    avoidErrorsForNotExistedHandlers,
    middlewares,
    normalizer,
  }: AmazonSqsChannelConfig) {
    super(
      name,
      avoidErrorsForNotExistedHandlers,
      middlewares,
      enableConsumer,
      normalizer,
    );
    let url;
    try {
      url = new URL(queueUrl);
    } catch (e) {
      throw new Error(`Invalid queue url (${queueUrl})`);
    }

    this.credentials = credentials;
    this.queueUrl = queueUrl;
    this.queueName = url.pathname.split('/').pop();
    this.endpoint = `${url.protocol}//${url.host}`;
    this.region = region;
    this.maxNumberOfMessages = maxNumberOfMessages ?? 1;
    this.visibilityTimeout = visibilityTimeout ?? 20;
    this.waitTimeSeconds = waitTimeSeconds ?? 10;
    this.autoCreate = autoCreate ?? false;
    this.deadLetterQueue = deadLetterQueue ?? false;
  }
}

interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}
