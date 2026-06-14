# Infrastructure Template

Use this document as the standard for writing infrastructure information in load test `scenario.md` and `results/*.md` documents.
In `scenario.md`, record the test assumptions. In `results/*.md`, record the values confirmed at execution time.

Do not guess unknown values. Leave them as `needs measurement` or `needs confirmation`.
You may omit details that do not affect load test results, but record any information that can affect throughput or response time comparisons.

## Load Generator

The `Load Generator` section must include enough information to determine whether k6 itself was the bottleneck.

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

### Writing Guidelines

- `Execution location`: Record where the load generator runs. The same script can produce different results when run locally, in CI, or inside a cluster.
- `CPU` and `Memory`: Record both physical or allocated resources and container limits when applicable.
- `k6 execution mode`: State whether k6 runs directly, in a container, or in CI because runtime limits may apply.
- `Network location`: Record enough information to understand the distance and path to the application server.
- `Load generator resource usage during execution`: In result documents, record actual usage so k6 saturation can be ruled in or out.

## Application Server

The `Application Server` section must include enough information to understand the request processing capacity and execution mode.

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

### Writing Guidelines

- `Server count` and `Process/replica count`: Make it clear whether the test targets a single process or a horizontally scaled deployment.
- `CPU` and `Memory`: In container environments, request/limit values usually affect results more directly than host specs, so record both when possible.
- `Node.js version` and `Key runtime options`: These can affect event loop behavior, GC, and worker pool behavior.
- `Load balancer/proxy`: Record whether traffic passes through one because timeout, keep-alive, and connection reuse behavior can change results.
- `Server resource usage during execution`: In result documents, record actual CPU, memory, and event loop delay for bottleneck analysis.

## Runtime Settings

- `NODE_ENV`: {value}
- `NODE_OPTIONS`: {value}
- `UV_THREADPOOL_SIZE`: {value}
- Worker/thread settings: {value}
- Connection pool: {value}
- Timeout: {value}

## Deployment Model

- Execution model: {local | Docker | Kubernetes | VM | cloud instance}
- Image or artifact: {tag, digest, build id, or none}
- Replica/pod/process count: {value}
- Resource request/limit: {value}

## External Dependencies

- DB: {type, location, resources, connection mode, or none}
- Redis/cache: {type, location, resources, connection mode, or none}
- Message queue: {type, location, resources, connection mode, or none}
- External API: {target, whether called, whether mocked, or none}

## Network Conditions

- Load generator to application server relationship: {same machine/cluster/VPC or not}
- TLS usage: {enabled | disabled}
- Proxy/load balancer path: {whether used, type}
- keep-alive/connection reuse condition: {setting or needs measurement}
- Bandwidth/latency constraints: {setting or needs measurement}

## Observability Tools

- k6 summary: {used | not used}
- Server CPU/memory: {observation method}
- Event loop delay: {observation method}
- Container metrics: {observation method}
- Logs/APM: {observation method}
