# {target_group}/{load_scenario} Load Test

## Purpose

{Describe which performance characteristic or bottleneck this test validates.}

## Infrastructure

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

### External Dependencies

- DB: {type, location, resources, connection mode, or none}
- Redis/cache: {type, location, resources, connection mode, or none}
- Message queue: {type, location, resources, connection mode, or none}
- External API: {target, whether called, whether mocked, or none}

### Network Conditions

- Load generator to application server relationship: {same machine/cluster/VPC or not}
- TLS usage: {enabled | disabled}
- Proxy/load balancer path: {whether used, type}
- keep-alive/connection reuse condition: {setting or needs measurement}

### Observability Tools

- k6 summary: {used | not used}
- Server CPU/memory: {observation method}
- Event loop delay: {observation method}
- Container metrics: {observation method}
- Logs/APM: {observation method}

## Test Target

- API Endpoint: `{METHOD} {path}`
- Response size: {bytes or needs measurement}
- Main processing path: {CPU, IO, DB, external API, etc.}
- Throughput-impacting characteristics: {description}

## Little's Law Estimates

- Target throughput `λ`: {n} req/s
- Target average response time `W`: {n} ms
- Expected concurrency `L = λW`: {n}
- k6 VU sizing rationale: {calculation and reason for the selected VU count}

## Traffic Conditions

- executor: {k6 executor}
- VUs or arrival rate: {value}
- duration/ramping: {value}
- timeUnit: {value}
- timeout: {value}
- Key environment variables: {values}

## Execution Command

```sh
pnpm {script}
```

## Success Criteria

- threshold: {k6 threshold}
- Expected response status: {status code}
- Allowed failure rate: {value}
- Allowed response time: {value}

## Result Interpretation Criteria

- Bottleneck criteria: {CPU, memory, event loop delay, network, DB, etc.}
- Key observed metrics: {metric list}
- Notes: {interpretation caveats}
