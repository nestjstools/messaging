export class MessageResponse {
  constructor(public responses: object[] = []) {}

  getFirst(): object | null {
    if (this.responses.length === 0) {
      return null;
    }

    return this.responses[0];
  }

  isEmpty(): boolean {
    return 0 === this.responses.length;
  }

  getAll(): object[] {
    return this.responses;
  }
}
