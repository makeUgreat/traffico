import { Module } from '@nestjs/common';
import { NodeCapacityLimitScenarioController } from './node-capacity-limit-scenario.controller';
import { NodeCapacityLimitScenarioService } from './node-capacity-limit-scenario.service';

@Module({
  controllers: [NodeCapacityLimitScenarioController],
  providers: [NodeCapacityLimitScenarioService],
})
export class NodeCapacityLimitScenarioModule {}
