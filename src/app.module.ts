import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { NodeCapacityLimitScenarioModule } from './scenarios/01_node_capacity_limit/node-capacity-limit-scenario.module';
import { EventLoopScenarioModule } from './scenarios/02_event_loop/event-loop-scenario.module';

@Module({
  imports: [
    HealthModule,
    MetricsModule,
    NodeCapacityLimitScenarioModule,
    EventLoopScenarioModule,
  ],
})
export class AppModule {}
