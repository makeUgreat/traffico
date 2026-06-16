import http from 'k6/http';

import { getEnv } from './env.ts';

type TimeRange = {
  start: Date;
  end: Date;
};

type PrometheusQuery = {
  name: string;
  unit: string;
  query: string;
  group: string;
  panel: string;
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
const loadGeneratorJob = getEnv('PROMETHEUS_LOAD_GENERATOR_JOB');
const loadGeneratorDeviceRegex = getEnv(
  'PROMETHEUS_LOAD_GENERATOR_DEVICE_REGEX',
);
const nodeExporterJob = getEnv('PROMETHEUS_NODE_EXPORTER_JOB');

function queries(testid: string): PrometheusQuery[] {
  const app = `namespace="${namespace}",job="${job}"`;
  const pod = `namespace="${namespace}",pod=~"${podRegex}"`;
  const container = `${pod},container!="POD",container!=""`;
  const zeroPerPod = `0 * sum(rate(container_cpu_usage_seconds_total{${container}}[1m])) by (pod)`;
  const test = `testid=~"${testid}"`;
  const loadGenerator = `job="${loadGeneratorJob}"`;
  const loadGeneratorNetwork = `${loadGenerator},device=~"${loadGeneratorDeviceRegex}"`;
  const nodeExporter = `job="${nodeExporterJob}"`;

  return [
    {
      name: 'k6RequestRate',
      unit: 'requests_per_second',
      group: 'loadTest',
      panel: 'k6 Request Rate',
      query: `sum by (testid) (rate(k6_http_reqs_total{${test}, scenario!="default"}[1m]))`,
    },
    {
      name: 'k6LatencyP95',
      unit: 'seconds',
      group: 'loadTest',
      panel: 'k6 Latency',
      query: `max by (testid) (k6_http_req_duration_p95{${test}, expected_response="true", scenario!="default"})`,
    },
    {
      name: 'k6LatencyP99',
      unit: 'seconds',
      group: 'loadTest',
      panel: 'k6 Latency',
      query: `max by (testid) (k6_http_req_duration_p99{${test}, expected_response="true", scenario!="default"})`,
    },
    {
      name: 'k6SuccessRatio',
      unit: 'ratio',
      group: 'loadTest',
      panel: 'k6 Success / Failure Ratio',
      query: `sum by (testid) (rate(k6_http_reqs_total{${test}, expected_response="true", scenario!="default"}[1m])) / sum by (testid) (rate(k6_http_reqs_total{${test}, scenario!="default"}[1m]))`,
    },
    {
      name: 'k6FailureRatio',
      unit: 'ratio',
      group: 'loadTest',
      panel: 'k6 Success / Failure Ratio',
      query: `1 - (sum by (testid) (rate(k6_http_reqs_total{${test}, expected_response="true", scenario!="default"}[1m])) / sum by (testid) (rate(k6_http_reqs_total{${test}, scenario!="default"}[1m])))`,
    },
    {
      name: 'k6Vus',
      unit: 'count',
      group: 'loadTest',
      panel: 'k6 VUs',
      query: `max by (testid) (k6_vus{${test}})`,
    },
    {
      name: 'k6VusMax',
      unit: 'count',
      group: 'loadTest',
      panel: 'k6 VUs',
      query: `max by (testid) (k6_vus_max{${test}})`,
    },
    {
      name: 'k6DroppedIterations',
      unit: 'iterations_per_second',
      group: 'loadTest',
      panel: 'k6 Dropped Iterations',
      query: `sum by (testid) (rate(k6_dropped_iterations_total{${test}, scenario!="default"}[1m]))`,
    },
    {
      name: 'loadGeneratorScrapeStatus',
      unit: 'status',
      group: 'loadGenerator',
      panel: 'Load Generator Scrape Status',
      query: `min(up{${loadGenerator}})`,
    },
    {
      name: 'loadGeneratorCpuUsageRatio',
      unit: 'ratio',
      group: 'loadGenerator',
      panel: 'Load Generator CPU Usage %',
      query: `1 - avg by (instance) (rate(node_cpu_seconds_total{${loadGenerator},mode="idle"}[1m]))`,
    },
    {
      name: 'loadGeneratorMemoryUsed',
      unit: 'bytes',
      group: 'loadGenerator',
      panel: 'Load Generator Memory',
      query: `node_memory_active_bytes{${loadGenerator}} + node_memory_wired_bytes{${loadGenerator}} + node_memory_compressed_bytes{${loadGenerator}}`,
    },
    {
      name: 'loadGeneratorMemoryTotal',
      unit: 'bytes',
      group: 'loadGenerator',
      panel: 'Load Generator Memory',
      query: `node_memory_total_bytes{${loadGenerator}}`,
    },
    {
      name: 'loadGeneratorNetworkReceive',
      unit: 'bytes_per_second',
      group: 'loadGenerator',
      panel: 'Load Generator Network RX/TX',
      query: `sum by (device) (rate(node_network_receive_bytes_total{${loadGeneratorNetwork}}[1m]))`,
    },
    {
      name: 'loadGeneratorNetworkTransmit',
      unit: 'bytes_per_second',
      group: 'loadGenerator',
      panel: 'Load Generator Network RX/TX',
      query: `sum by (device) (rate(node_network_transmit_bytes_total{${loadGeneratorNetwork}}[1m]))`,
    },
    {
      name: 'eventLoopP99',
      unit: 'seconds',
      group: 'applicationPods',
      panel: 'Event Loop p99',
      query: `nodejs_eventloop_lag_p99_seconds{${app}}`,
    },
    {
      name: 'processCpu',
      unit: 'cores',
      group: 'applicationPods',
      panel: 'Process CPU',
      query: `sum(rate(process_cpu_seconds_total{${app}}[1m]))`,
    },
    {
      name: 'podCpu',
      unit: 'cores',
      group: 'applicationPods',
      panel: 'Pod CPU',
      query: `sum(rate(container_cpu_usage_seconds_total{${container}}[1m])) by (pod)`,
    },
    {
      name: 'podCpuTotal',
      unit: 'cores',
      group: 'applicationPods',
      panel: 'Pod CPU Usage vs Requests/Limits',
      query: `sum(rate(container_cpu_usage_seconds_total{${container}}[1m]))`,
    },
    {
      name: 'podCpuRequests',
      unit: 'cores',
      group: 'applicationPods',
      panel: 'Pod CPU Usage vs Requests/Limits',
      query: `sum(kube_pod_container_resource_requests{${pod},resource="cpu"})`,
    },
    {
      name: 'podCpuLimits',
      unit: 'cores',
      group: 'applicationPods',
      panel: 'Pod CPU Usage vs Requests/Limits',
      query: `sum(kube_pod_container_resource_limits{${pod},resource="cpu"})`,
    },
    {
      name: 'cpuThrottlingRatio',
      unit: 'ratio',
      group: 'applicationPods',
      panel: 'CPU Throttling Ratio',
      query: `(sum(rate(container_cpu_cfs_throttled_periods_total{${container}}[1m])) by (pod) / sum(rate(container_cpu_cfs_periods_total{${container}}[1m])) by (pod)) or on (pod) (${zeroPerPod})`,
    },
    {
      name: 'cpuThrottlingRatioClamped',
      unit: 'ratio',
      group: 'applicationPods',
      panel: 'CPU Throttling Ratio',
      query: `clamp_max(sum(rate(container_cpu_cfs_throttled_periods_total{${container}}[1m])) by (pod) / sum(rate(container_cpu_cfs_periods_total{${container}}[1m])) by (pod), 1) or on (pod) (${zeroPerPod})`,
    },
    {
      name: 'memoryWorkingSet',
      unit: 'bytes',
      group: 'applicationPods',
      panel: 'Pod Memory',
      query: `sum(container_memory_working_set_bytes{${container}}) by (pod)`,
    },
    {
      name: 'memoryWorkingSetTotal',
      unit: 'bytes',
      group: 'applicationPods',
      panel: 'Pod Memory Usage vs Requests/Limits',
      query: `sum(container_memory_working_set_bytes{${container}})`,
    },
    {
      name: 'podMemoryRequests',
      unit: 'bytes',
      group: 'applicationPods',
      panel: 'Pod Memory Usage vs Requests/Limits',
      query: `sum(kube_pod_container_resource_requests{${pod},resource="memory"})`,
    },
    {
      name: 'podMemoryLimits',
      unit: 'bytes',
      group: 'applicationPods',
      panel: 'Pod Memory Usage vs Requests/Limits',
      query: `sum(kube_pod_container_resource_limits{${pod},resource="memory"})`,
    },
    {
      name: 'podRestarts',
      unit: 'count',
      group: 'applicationPods',
      panel: 'Pod Restarts / OOMKilled',
      query: `sum(increase(kube_pod_container_status_restarts_total{${pod}}[5m])) or vector(0)`,
    },
    {
      name: 'podOomKilled',
      unit: 'count',
      group: 'applicationPods',
      panel: 'Pod Restarts / OOMKilled',
      query: `sum(kube_pod_container_status_last_terminated_reason{${pod},reason="OOMKilled"}) or vector(0)`,
    },
    {
      name: 'networkReceive',
      unit: 'bytes_per_second',
      group: 'applicationPods',
      panel: 'Pod Network RX/TX',
      query: `sum(rate(container_network_receive_bytes_total{${pod}}[1m])) by (pod)`,
    },
    {
      name: 'networkTransmit',
      unit: 'bytes_per_second',
      group: 'applicationPods',
      panel: 'Pod Network RX/TX',
      query: `sum(rate(container_network_transmit_bytes_total{${pod}}[1m])) by (pod)`,
    },
    {
      name: 'gcP95',
      unit: 'seconds',
      group: 'applicationPods',
      panel: 'GC p95',
      query: `histogram_quantile(0.95, sum(rate(nodejs_gc_duration_seconds_bucket{${app}}[1m])) by (le))`,
    },
    {
      name: 'nodeCpuUsageRatio',
      unit: 'ratio',
      group: 'nodeResources',
      panel: 'Node CPU Usage %',
      query: `1 - avg by (instance) (rate(node_cpu_seconds_total{${nodeExporter},mode="idle"}[1m]))`,
    },
    {
      name: 'nodeMemoryUsageRatio',
      unit: 'ratio',
      group: 'nodeResources',
      panel: 'Node Memory Usage %',
      query: `1 - (node_memory_MemAvailable_bytes{${nodeExporter}} / node_memory_MemTotal_bytes{${nodeExporter}})`,
    },
    {
      name: 'nodeNetworkReceive',
      unit: 'bytes_per_second',
      group: 'nodeResources',
      panel: 'Node Network RX/TX',
      query: `sum by (instance) (rate(node_network_receive_bytes_total{${nodeExporter},device!~"lo|veth.*|cali.*|flannel.*|cni.*"}[1m]))`,
    },
    {
      name: 'nodeNetworkTransmit',
      unit: 'bytes_per_second',
      group: 'nodeResources',
      panel: 'Node Network RX/TX',
      query: `sum by (instance) (rate(node_network_transmit_bytes_total{${nodeExporter},device!~"lo|veth.*|cali.*|flannel.*|cni.*"}[1m]))`,
    },
    {
      name: 'nodeFilesystemUsageRatio',
      unit: 'ratio',
      group: 'nodeResources',
      panel: 'Node Filesystem Usage %',
      query: `1 - (node_filesystem_avail_bytes{${nodeExporter},mountpoint="/",fstype!~"tmpfs|ramfs"} / node_filesystem_size_bytes{${nodeExporter},mountpoint="/",fstype!~"tmpfs|ramfs"})`,
    },
    {
      name: 'nodeDiskRead',
      unit: 'bytes_per_second',
      group: 'nodeResources',
      panel: 'Node Disk I/O',
      query: `sum by (instance) (rate(node_disk_read_bytes_total{${nodeExporter},device!~"loop.*|ram.*"}[1m]))`,
    },
    {
      name: 'nodeDiskWrite',
      unit: 'bytes_per_second',
      group: 'nodeResources',
      panel: 'Node Disk I/O',
      query: `sum by (instance) (rate(node_disk_written_bytes_total{${nodeExporter},device!~"loop.*|ram.*"}[1m]))`,
    },
    {
      name: 'clusterCpuUsageRatio',
      unit: 'ratio',
      group: 'clusterOverview',
      panel: 'Cluster CPU Usage %',
      query: `sum(rate(node_cpu_seconds_total{${nodeExporter},mode!="idle"}[1m])) / sum(rate(node_cpu_seconds_total{${nodeExporter}}[1m]))`,
    },
    {
      name: 'clusterMemoryUsageRatio',
      unit: 'ratio',
      group: 'clusterOverview',
      panel: 'Cluster Memory Usage %',
      query: `sum(node_memory_MemTotal_bytes{${nodeExporter}} - node_memory_MemAvailable_bytes{${nodeExporter}}) / sum(node_memory_MemTotal_bytes{${nodeExporter}})`,
    },
    {
      name: 'pendingFailedPods',
      unit: 'count',
      group: 'clusterOverview',
      panel: 'Pending / Failed Pods',
      query: `sum(kube_pod_status_phase{${pod},phase=~"Pending|Failed|Unknown"} == 1) or vector(0)`,
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

function collect(query: PrometheusQuery, range: TimeRange) {
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

export function collectPrometheusResources(range: TimeRange, testid: string) {
  return {
    prometheus: {
      url: prometheusUrl,
      step,
      namespace,
      job,
      podRegex,
      loadGeneratorJob,
      loadGeneratorDeviceRegex,
      nodeExporterJob,
    },
    metrics: queries(testid).map((query) => collect(query, range)),
  };
}
