import http from 'k6/http';

import { getEnv } from './env.ts';

type TimeRange = {
  start: Date;
  end: Date;
};

type PrometheusResponse = {
  status?: string;
  error?: string;
  data?: {
    result?: Array<{
      metric?: Record<string, string>;
      values?: Array<[number, string]>;
    }>;
  };
};

const prometheusUrl = getEnv('PROMETHEUS_URL');
const step = getEnv('PROMETHEUS_STEP');
const namespace = getEnv('PROMETHEUS_NAMESPACE');
const job = getEnv('PROMETHEUS_JOB');
const podRegex = getEnv('PROMETHEUS_POD_REGEX');

function queries(): Array<{ name: string; unit: string; query: string }> {
  const app = `namespace="${namespace}",job="${job}"`;
  const pod = `namespace="${namespace}",pod=~"${podRegex}"`;
  const container = `${pod},container!="POD",container!=""`;

  return [
    {
      name: 'eventLoopP99',
      unit: 'seconds',
      query: `nodejs_eventloop_lag_p99_seconds{${app}}`,
    },
    {
      name: 'processCpu',
      unit: 'cores',
      query: `sum(rate(process_cpu_seconds_total{${app}}[1m]))`,
    },
    {
      name: 'podCpu',
      unit: 'cores',
      query: `sum(rate(container_cpu_usage_seconds_total{${container}}[1m])) by (pod)`,
    },
    {
      name: 'cpuThrottlingRatio',
      unit: 'ratio',
      query: `sum(rate(container_cpu_cfs_throttled_periods_total{${container}}[1m])) by (pod) / sum(rate(container_cpu_cfs_periods_total{${container}}[1m])) by (pod)`,
    },
    {
      name: 'memoryWorkingSet',
      unit: 'bytes',
      query: `sum(container_memory_working_set_bytes{${container}}) by (pod)`,
    },
    {
      name: 'networkReceive',
      unit: 'bytes_per_second',
      query: `sum(rate(container_network_receive_bytes_total{${pod}}[1m])) by (pod)`,
    },
    {
      name: 'networkTransmit',
      unit: 'bytes_per_second',
      query: `sum(rate(container_network_transmit_bytes_total{${pod}}[1m])) by (pod)`,
    },
    {
      name: 'gcP95',
      unit: 'seconds',
      query: `histogram_quantile(0.95, sum(rate(nodejs_gc_duration_seconds_bucket{${app}}[1m])) by (le))`,
    },
  ];
}

function requestUrl(query: string, range: TimeRange): string {
  return `${prometheusUrl.replace(/\/$/, '')}/api/v1/query_range?${[
    ['query', query],
    ['start', String(Math.floor(range.start.getTime() / 1000))],
    ['end', String(Math.ceil(range.end.getTime() / 1000))],
    ['step', step],
  ]
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')}`;
}

function summarize(values: number[]): {
  sampleCount: number;
  avg: number | null;
  p95: number | null;
  max: number | null;
  last: number | null;
} {
  if (values.length === 0) {
    return { sampleCount: 0, avg: null, p95: null, max: null, last: null };
  }

  const sorted = [...values].sort((a, b) => a - b);

  return {
    sampleCount: values.length,
    avg: values.reduce((sum, value) => sum + value, 0) / values.length,
    p95: sorted[Math.ceil(sorted.length * 0.95) - 1] ?? null,
    max: sorted[sorted.length - 1] ?? null,
    last: values[values.length - 1] ?? null,
  };
}

function collect(
  query: { name: string; unit: string; query: string },
  range: TimeRange,
) {
  const response = http.get(requestUrl(query.query, range), {
    responseType: 'text',
  });

  if (response.status !== 200 || typeof response.body !== 'string') {
    return {
      ...query,
      status: 'error',
      error: `HTTP ${response.status}`,
      series: [],
      summary: summarize([]),
    };
  }

  try {
    const body = JSON.parse(response.body) as PrometheusResponse;

    if (body.status !== 'success') {
      return {
        ...query,
        status: 'error',
        error: body.error ?? 'Prometheus query failed',
        series: [],
        summary: summarize([]),
      };
    }

    const series = (body.data?.result ?? []).map((item) => ({
      labels: item.metric ?? {},
      values: (item.values ?? []).map(([timestamp, rawValue]) => ({
        timestamp: Number(timestamp),
        value: Number(rawValue),
      })),
    }));
    const values = series.flatMap((item) =>
      item.values.map((sample) => sample.value).filter(Number.isFinite),
    );

    return {
      ...query,
      status: values.length === 0 ? 'missing' : 'ok',
      series,
      summary: summarize(values),
    };
  } catch (error) {
    return {
      ...query,
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      series: [],
      summary: summarize([]),
    };
  }
}

export function collectPrometheusResources(range: TimeRange) {
  return {
    prometheus: {
      url: prometheusUrl,
      step,
      namespace,
      job,
      podRegex,
    },
    metrics: queries().map((query) => collect(query, range)),
  };
}
