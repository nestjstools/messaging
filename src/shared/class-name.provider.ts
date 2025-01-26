export class ClassNameProvider {
  static getClassName(value: object): string {
    return value.constructor.name === 'Function' && 'name' in value
      ? (value as { name: string }).name
      : value.constructor.name;
  }
}
