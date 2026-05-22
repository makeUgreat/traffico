import { MetricsService } from '../../src/metrics/metrics.service';

describe('MetricsService', () => {
  describe('getMetrics', () => {
    it('metrics가 수집되면 Prometheus metrics를 반환한다', async () => {
      const metricsService = new MetricsService();

      await expect(metricsService.getMetrics()).resolves.toContain(
        'process_cpu_user_seconds_total',
      );
    });
  });

  describe('getContentType', () => {
    it('metrics content type으로 text/plain을 반환한다', () => {
      const metricsService = new MetricsService();

      expect(metricsService.getContentType()).toContain('text/plain');
    });
  });
});
