export interface Registry<T> {
  register(name: string, element: T);

  getByName(name: string): T;

  getAll(): T[];
}
