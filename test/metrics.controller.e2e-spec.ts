import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createE2eApp } from './create-e2e-app';

describe('MetricsController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createE2eApp();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /metrics', () => {
    it('정상 요청이면 Prometheus metrics를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.body).toContain('process_cpu_user_seconds_total');
    });
  });
});
