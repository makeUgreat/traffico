import { Injectable } from '@nestjs/common';
import type { NodeCapacityLimitResponse } from './node-capacity-limit.contract';

@Injectable()
export class NodeCapacityLimitScenarioService {
  getBaseline(): NodeCapacityLimitResponse {
    return { status: 'ok' };
  }
}
