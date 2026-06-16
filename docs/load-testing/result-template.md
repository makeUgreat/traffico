# {target_group}/{load_scenario} {purpose} Result

## Execution Information

- Execution time: {YYYY-MM-DD HH:mm:ss timezone}
- Execution command: `{command}`
- git commit: `{hash}`
- Runner: {name}

## Execution Environment

Follow [infrastructure-template.md](infrastructure-template.md) for detailed fields.

### Load Generator

- Execution location: {local | Docker | Kubernetes | VM | cloud instance}
- Execution machine: {hostname or instance type}
- OS/architecture: {example: macOS arm64, Ubuntu x86_64}
- CPU: {core count, limit}
- Memory: {total memory, limit}
- k6 version: {version}
- k6 execution mode: {direct CLI, container, CI, etc.}
- Network location: {whether it is on the same machine/cluster/VPC as the application server}
- Network constraints: {bandwidth limit, proxy, VPN, NAT, needs measurement}
- Load generator resource usage during execution: {CPU, memory, network usage, or needs measurement}

### Application Server

- Server count: {n}
- Server role: {API, worker, gateway, etc.}
- Execution location: {local | Docker | Kubernetes | VM | cloud instance}
- Machine/instance: {hostname, node name, or instance type}
- OS/architecture: {example: Ubuntu x86_64}
- CPU: {core count, request/limit, or instance spec}
- Memory: {total memory, request/limit, or instance spec}
- Node.js version: {version}
- Application execution mode: {node, nest start, PM2, container command, etc.}
- Process/replica count: {process count, pod count, worker count}
- Key runtime options: {NODE_OPTIONS, GC-related options, UV_THREADPOOL_SIZE, etc.}
- Port/protocol: {HTTP/HTTPS, port, TLS usage}
- Load balancer/proxy: {whether used, type, timeout settings}
- Server resource usage during execution: {CPU, memory, event loop delay, or needs measurement}

### Key Environment Variables

- `TARGET_BASE_URLS`: {comma-separated URL list}
- `LOAD_REQUEST_TIMEOUT`: {value}
- `{name}`: {value}

## k6 Results

- checks: {value}
- http_req_failed: {value}
- http_req_duration: {avg, p90, p95, p99}
- http_reqs: {value}
- iterations: {value}
- vus: {value}
- vus_max: {value}

## Server Metrics

- CPU: {value}
- Memory: {value}
- Event loop delay: {value}
- GC: {value or needs measurement}
- Network: {value or needs measurement}
- Other observed metrics: {value}

## Result Interpretation

- Success criteria met: {pass | fail}
- Main bottleneck: {description}
- Notable findings: {description}
- Difference from `scenario.md` estimates: {description}

## Follow-up Actions

- Re-run conditions: {description}
- Improvement work: {description}
- Additional observations needed: {description}
