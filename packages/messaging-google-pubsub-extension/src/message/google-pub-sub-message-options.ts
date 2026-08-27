export class GooglePubSubMessageOptions {
  constructor(public readonly attributes: { [key: string]: string } = {}) {}
}
