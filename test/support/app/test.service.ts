import { Injectable } from '@nestjs/common';
import { SpyDataService } from './spy-data.service';

@Injectable()
export class TestService {
  constructor(private readonly service: SpyDataService) {
  }

  public markAsDone(value: string): void {
    this.service.spy(value);
  }
}
