import { Injectable } from '@nestjs/common';
import type { CpuBlockingResponse } from './cpu-blocking.contract';

@Injectable()
export class EventLoopScenarioService {
  getBaseline(): CpuBlockingResponse {
    return { status: 'ok' };
  }

  getCpuBlocking(blockMs: number): CpuBlockingResponse {
    this.blockEventLoop(blockMs);

    return { status: 'ok' };
  }

  private blockEventLoop(durationMs: number): void {
    const deadline = performance.now() + durationMs;

    while (performance.now() < deadline) {
      // Intentionally block the main thread for the event-loop load scenario.
    }
  }
}
