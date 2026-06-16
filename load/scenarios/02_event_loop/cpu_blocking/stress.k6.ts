import { check } from 'k6';
import http from 'k6/http';
import type { Options } from 'k6/options';

import { getEnv } from '../../../common/env.ts';
import { getTargetRequestTags, getTargetUrl } from '../../../common/target.ts';
import { createTestId, logTestId } from '../../../common/test-id.ts';

const requestTimeout = getEnv('LOAD_REQUEST_TIMEOUT');

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
  const cpuBlockMs = 50;
  const response = http.get(
    getTargetUrl(`/event-loop/cpu-blocking?ms=${cpuBlockMs}`),
    {
      timeout: requestTimeout,
      tags: getTargetRequestTags(),
    },
  );

  check(response, {
    'GET /event-loop/cpu-blocking returns 200': (res) => res.status === 200,
  });
}
