import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller()
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get('livez')
  getLiveness(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('readyz')
  @HealthCheck()
  getReadiness() {
    return this.health.check([]);
  }
}
