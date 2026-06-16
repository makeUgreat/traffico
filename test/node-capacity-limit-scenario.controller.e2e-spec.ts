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

  describe('GET /node-capacity-limit/cpu-bound', () => {
    it('파라미터가 없으면 기본 CPU 작업 후 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/node-capacity-limit/cpu-bound',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect(response.body).toBe('{"status":"ok"}');
    });

    it('ms 파라미터를 전달하면 해당 CPU 작업 후 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/node-capacity-limit/cpu-bound?ms=0',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect(response.body).toBe('{"status":"ok"}');
    });

    it('ms가 허용 범위를 넘으면 400을 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/node-capacity-limit/cpu-bound?ms=1001',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /node-capacity-limit/async-io', () => {
    it('파라미터가 없으면 기본 비동기 대기 후 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/node-capacity-limit/async-io',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect(response.body).toBe('{"status":"ok"}');
    });

    it('delayMs 파라미터를 전달하면 해당 시간 대기 후 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/node-capacity-limit/async-io?delayMs=1',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect(response.body).toBe('{"status":"ok"}');
    });

    it('delayMs가 숫자가 아니면 400을 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/node-capacity-limit/async-io?delayMs=abc',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /node-capacity-limit/async-libuv', () => {
    it('파라미터가 없으면 기본 libuv 작업 후 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/node-capacity-limit/async-libuv',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect(response.body).toBe('{"status":"ok"}');
    });

    it('libuv 작업 파라미터를 전달하면 해당 작업 후 상태 ok를 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/node-capacity-limit/async-libuv?iterations=1&keylen=16&digest=sha256',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect(response.body).toBe('{"status":"ok"}');
    });

    it('digest가 허용되지 않은 값이면 400을 반환한다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/node-capacity-limit/async-libuv?digest=md5',
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
