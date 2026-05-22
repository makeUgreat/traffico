import { Controller, Get, Res } from '@nestjs/common';
import { MetricsService } from './metrics.service';

type HeaderResponse = {
  header(name: string, value: string): unknown;
};

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(
    @Res({ passthrough: true }) reply: HeaderResponse,
  ): Promise<string> {
    reply.header('Content-Type', this.metricsService.getContentType());

    return this.metricsService.getMetrics();
  }
}
