import { Injectable } from '@nestjs/common';

@Injectable()
export class SpyDataService {
  private readonly collection: string[] = [];

  spy(value: string): void {
    this.collection.push(value);
  }

  getAllData(): string[] {
    return this.collection;
  }

  getFirst(): null | string {
    if (this.collection.length === 0) {
      return null;
    }

    return this.collection[0];
  }
}
