import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

  constructor() {
    collectDefaultMetrics({
      register: this.registry,
    });
  }

  getContentType(): string {
    return this.registry.contentType;
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
