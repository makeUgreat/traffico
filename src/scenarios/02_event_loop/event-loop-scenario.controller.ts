import { Controller, Get, Query } from '@nestjs/common';
import { parseCpuBlockingRequest } from './cpu-blocking.contract';
import type { CpuBlockingResponse } from './cpu-blocking.contract';
import { EventLoopScenarioService } from './event-loop-scenario.service';

@Controller('event-loop')
export class EventLoopScenarioController {
  constructor(private readonly service: EventLoopScenarioService) {}

  @Get('baseline')
  getBaseline(): CpuBlockingResponse {
    return this.service.getBaseline();
  }

  @Get('cpu-blocking')
  getCpuBlocking(@Query('ms') ms?: string): CpuBlockingResponse {
    const request = parseCpuBlockingRequest(ms);

    return this.service.getCpuBlocking(request.ms);
  }
}
