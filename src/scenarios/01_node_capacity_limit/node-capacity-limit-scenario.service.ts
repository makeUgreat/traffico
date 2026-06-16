import { Injectable } from '@nestjs/common';
import { pbkdf2 } from 'node:crypto';
import { promisify } from 'node:util';
import type { NodeCapacityLimitResponse } from './node-capacity-limit.contract';

const pbkdf2Async = promisify(pbkdf2);

@Injectable()
export class NodeCapacityLimitScenarioService {
  getBaseline(): NodeCapacityLimitResponse {
    return { status: 'ok' };
  }

  getCpuBound(durationMs: number): NodeCapacityLimitResponse {
    this.runCpuBoundWork(durationMs);

    return { status: 'ok' };
  }

  async getAsyncIo(delayMs: number): Promise<NodeCapacityLimitResponse> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, delayMs);
    });

    return { status: 'ok' };
  }

  async getAsyncLibuv(
    iterations: number,
    keylen: number,
    digest: string,
  ): Promise<NodeCapacityLimitResponse> {
    await pbkdf2Async(
      'node-capacity-limit',
      'traffico',
      iterations,
      keylen,
      digest,
    );

    return { status: 'ok' };
  }

  private runCpuBoundWork(durationMs: number): void {
    const deadline = performance.now() + durationMs;

    while (performance.now() < deadline) {
      // Intentionally occupy the JS main thread for the CPU capacity scenario.
    }
  }
}
