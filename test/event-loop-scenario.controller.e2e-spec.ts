import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createE2eApp } from './create-e2e-app';

describe('EventLoopScenarioController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createE2eApp();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /event-loop/baseline', () => {
    it('정상 요청이면 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/event-loop/baseline',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect(response.body).toBe('{"status":"ok"}');
    });
  });

  describe('GET /event-loop/cpu-blocking', () => {
    it('정상 요청이면 baseline과 같은 크기의 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/event-loop/cpu-blocking?ms=1',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect(response.body).toBe('{"status":"ok"}');
    });

    it('ms가 숫자가 아니면 400을 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/event-loop/cpu-blocking?ms=abc',
      });

      expect(response.statusCode).toBe(400);
    });

    it('ms가 허용 범위를 넘으면 400을 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/event-loop/cpu-blocking?ms=1001',
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
