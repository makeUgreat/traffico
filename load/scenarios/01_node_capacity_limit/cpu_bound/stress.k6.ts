import { check } from 'k6';
import http from 'k6/http';
import type { Options } from 'k6/options';

import { getEnv, getOptionalEnv } from '../../../common/env.ts';
import { collectPrometheusResources } from '../../../common/prometheus-resources.ts';
import { createTestId, getTestId, logTestId } from '../../../common/test-id.ts';

const baseUrl = getEnv('TARGET_BASE_URL');
const requestTimeout = getEnv('LOAD_REQUEST_TIMEOUT');
const cpuBoundMs = getOptionalEnv('CPU_BOUND_MS', '50');
const targetPath = `/node-capacity-limit/cpu-bound?ms=${cpuBoundMs}`;
const scriptPath =
  'load/scenarios/01_node_capacity_limit/cpu_bound/stress.k6.ts';
const resultsDir = 'load/scenarios/01_node_capacity_limit/cpu_bound/results';
const purpose = 'stress';

export const options: Options = {
  tags: {
    testid: createTestId(),
  },
  vus: 50,
  duration: '3m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

export function setup(): void {
  logTestId();
}

export default function (): void {
  const response = http.get(`${baseUrl}${targetPath}`, {
    timeout: requestTimeout,
  });

  check(response, {
    [`GET ${targetPath} returns 200`]: (res) => res.status === 200,
  });
}

export function handleSummary(data: {
  state?: { testRunDurationMs?: number };
}): Record<string, string> {
  const testid = getTestId();
  const endedAt = new Date();
  const durationMs = data.state?.testRunDurationMs ?? 0;
  const startedAt = new Date(endedAt.getTime() - durationMs);
  const outputBasePath = `${resultsDir}/${endedAt
    .toISOString()
    .replace(/[:.]/g, '-')}-${purpose}`;

  return {
    [`${outputBasePath}.json`]: JSON.stringify(
      {
        schemaVersion: 1,
        test: {
          testid,
          scriptPath,
          purpose,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          durationMs,
        },
        summary: data,
      },
      null,
      2,
    ),
    [`${outputBasePath}.resources.json`]: JSON.stringify(
      {
        schemaVersion: 1,
        test: {
          testid,
          scriptPath,
          purpose,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          durationMs,
          summaryJsonPath: `${outputBasePath}.json`,
        },
        ...collectPrometheusResources(
          {
            start: startedAt,
            end: endedAt,
          },
          testid,
        ),
      },
      null,
      2,
    ),
  };
}
