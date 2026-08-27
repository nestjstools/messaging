export class NatsMessageOptions {
  constructor(public readonly headers: Record<string, string> = {}) {}
}
