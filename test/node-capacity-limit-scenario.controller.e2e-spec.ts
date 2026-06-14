import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createE2eApp } from './create-e2e-app';

describe('NodeCapacityLimitScenarioController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createE2eApp();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /node-capacity-limit/baseline', () => {
    it('정상 요청이면 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/node-capacity-limit/baseline',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect(response.body).toBe('{"status":"ok"}');
    });
  });
});
