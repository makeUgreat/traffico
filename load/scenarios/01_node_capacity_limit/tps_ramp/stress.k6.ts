import { check } from 'k6';
import http from 'k6/http';
import type { Options } from 'k6/options';

import { getEnv } from '../../../common/env.ts';

const baseUrl = getEnv('BASE_URL', 'http://localhost:3000');
const defaultTimeout = getEnv('K6_TIMEOUT', '5s');
const targetPath = '/node-capacity-limit/baseline';

export const options: Options = {
  scenarios: {
    tps_ramp: {
      executor: 'ramping-arrival-rate',
      startRate: 100,
      timeUnit: '1s',
      preAllocatedVUs: 200,
      maxVUs: 2000,
      stages: [
        { target: 500, duration: '1m' },
        { target: 1000, duration: '1m' },
        { target: 2000, duration: '1m' },
        { target: 2000, duration: '1m' },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function (): void {
  const response = http.get(`${baseUrl}${targetPath}`, {
    timeout: defaultTimeout,
  });

  check(response, {
    [`GET ${targetPath} returns 200`]: (res) => res.status === 200,
  });
}
