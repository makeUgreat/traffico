import { check } from 'k6';
import http from 'k6/http';
import type { Options } from 'k6/options';

import { getEnv } from '../../../common/env.ts';
import { collectPrometheusResources } from '../../../common/prometheus-resources.ts';
import { createTestId, getTestId, logTestId } from '../../../common/test-id.ts';

const baseUrl = getEnv('TARGET_BASE_URL');
const requestTimeout = getEnv('LOAD_REQUEST_TIMEOUT');
const targetPath = '/node-capacity-limit/baseline';
const resultsDir = 'load/scenarios/01_node_capacity_limit/tps_ramp/results';
const purpose = 'stress';

export const options: Options = {
  tags: {
    testid: createTestId(),
  },
  scenarios: {
    node_max_throughput: {
      executor: 'ramping-arrival-rate',
      timeUnit: '1s',
      preAllocatedVUs: 500,
      maxVUs: 5000,
      stages: [
        { target: 1000, duration: '1m' },
        { target: 5000, duration: '1m' },
        { target: 10000, duration: '1m' },
        { target: 15000, duration: '1m' },
        { target: 20000, duration: '1m' },
      ],
    },
  },
  thresholds: {
    http_req_failed: [
      {
        threshold: 'rate<0.01',
      },
    ],
    http_req_duration: [
      {
        threshold: 'p(95)<1000',
      },
    ],
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
          scriptPath:
            'load/scenarios/01_node_capacity_limit/tps_ramp/stress.k6.ts',
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
          scriptPath:
            'load/scenarios/01_node_capacity_limit/tps_ramp/stress.k6.ts',
          purpose,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          durationMs,
          summaryJsonPath: `${outputBasePath}.json`,
        },
        ...collectPrometheusResources({
          start: startedAt,
          end: endedAt,
        }),
      },
      null,
      2,
    ),
  };
}
