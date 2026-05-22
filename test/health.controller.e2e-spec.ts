import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createE2eApp } from './create-e2e-app';

describe('HealthController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createE2eApp();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /livez', () => {
    it('정상 요청이면 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/livez',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
    });
  });

  describe('GET /readyz', () => {
    it('정상 요청이면 readiness 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/readyz',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        status: 'ok',
        info: {},
        error: {},
        details: {},
      });
    });
  });
});
