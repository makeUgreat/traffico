import { Controller, Get, Query } from '@nestjs/common';
import {
  parseAsyncIoRequest,
  parseAsyncLibuvRequest,
  parseCpuBoundRequest,
} from './node-capacity-limit.contract';
import type { NodeCapacityLimitResponse } from './node-capacity-limit.contract';
import { NodeCapacityLimitScenarioService } from './node-capacity-limit-scenario.service';

@Controller('node-capacity-limit')
export class NodeCapacityLimitScenarioController {
  constructor(private readonly service: NodeCapacityLimitScenarioService) {}

  @Get('baseline')
  getBaseline(): NodeCapacityLimitResponse {
    return this.service.getBaseline();
  }

  @Get('cpu-bound')
  getCpuBound(@Query('ms') ms?: string): NodeCapacityLimitResponse {
    const request = parseCpuBoundRequest(ms);

    return this.service.getCpuBound(request.ms);
  }

  @Get('async-io')
  async getAsyncIo(
    @Query('delayMs') delayMs?: string,
  ): Promise<NodeCapacityLimitResponse> {
    const request = parseAsyncIoRequest(delayMs);

    return this.service.getAsyncIo(request.delayMs);
  }

  @Get('async-libuv')
  async getAsyncLibuv(
    @Query('iterations') iterations?: string,
    @Query('keylen') keylen?: string,
    @Query('digest') digest?: string,
  ): Promise<NodeCapacityLimitResponse> {
    const request = parseAsyncLibuvRequest(iterations, keylen, digest);

    return this.service.getAsyncLibuv(
      request.iterations,
      request.keylen,
      request.digest,
    );
  }
}
