export interface MessageNormalizer {
  normalize(message: object, type: string): Promise<string | object>;

  denormalize(message: string|object, type: string): Promise<object>;
}
