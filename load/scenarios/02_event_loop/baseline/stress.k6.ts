import { check } from 'k6';
import http from 'k6/http';
import type { Options } from 'k6/options';

import { getEnv } from '../../../common/env.ts';

const baseUrl = getEnv('BASE_URL', 'http://localhost:3000');
const defaultTimeout = getEnv('K6_TIMEOUT', '5s');

export const options: Options = {
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

export default function (): void {
  const response = http.get(`${baseUrl}/event-loop/baseline`, {
    timeout: defaultTimeout,
  });

  check(response, {
    'GET /event-loop/baseline returns 200': (res) => res.status === 200,
  });
}
