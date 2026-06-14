import { Controller, Get } from '@nestjs/common';
import type { NodeCapacityLimitResponse } from './node-capacity-limit.contract';
import { NodeCapacityLimitScenarioService } from './node-capacity-limit-scenario.service';

@Controller('node-capacity-limit')
export class NodeCapacityLimitScenarioController {
  constructor(private readonly service: NodeCapacityLimitScenarioService) {}

  @Get('baseline')
  getBaseline(): NodeCapacityLimitResponse {
    return this.service.getBaseline();
  }
}
