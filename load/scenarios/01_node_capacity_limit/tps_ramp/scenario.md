# 01_node_capacity_limit/tps_ramp 부하테스트

## 목적

동일 API를 목표 TPS 기준으로 단계적으로 밀어붙여 현재 인프라에서 먼저 포화되는 지점이 Node CPU Computing인지 네트워크 대역폭인지 확인한다.

이 시나리오는 병목을 인위적으로 만들지 않는다. 추후 CPU blocking, 큰 payload, DB, cache 같은 원인 분리 시나리오를 추가하더라도, 첫 측정은 같은 API의 자연 한계를 확인하는 기준선으로 둔다.

## 테스트 대상

- 기본 대상 API: `GET /node-capacity-limit/baseline`
- 기본 대상 주소: `http://localhost:3000`
- 대상 주소는 `load/.env`의 `TARGET_BASE_URL`로 변경한다.

## 인프라 구성

- 실행 위치: 로컬 개발 머신 또는 k6 전용 부하 발생 노드
- 대상 서버: `pnpm start:dev`, `pnpm start`, `pnpm start:prod` 또는 Kubernetes 배포 환경의 traffico 서버
- Node 런타임: Node v24.15.0 LTS
- k6 실행기: 로컬 또는 내부망 부하 발생 서버
- 병목 판단 시 같은 시간대의 Node CPU 사용률, event loop lag, 컨테이너 CPU limit/throttling, NIC RX/TX bps, packet drop/retransmit, k6 `dropped_iterations`를 함께 본다.

## Little's Law 예상 수치

- 목표 처리량 `λ`: 기본 최대 80000 req/s
- 목표 평균 응답 시간 `W`: 100 ms = 0.1 s
- 예상 동시 처리량 `L = λW`: 80000 \* 0.1 = 8000
- k6 VU 산정 근거: 목표 최대 80000 req/s와 p95 100 ms 기준 이론상 동시성은 약 8000이다. 짧은 시간 동안 Node 자체 처리량 한계 근처를 찾는 목적이므로 pre-allocated VU를 500으로 두고, latency가 상승하는 구간에서도 부하 발생기가 먼저 막히지 않도록 max VU는 5000으로 둔다.

## 트래픽 조건

- executor: `ramping-arrival-rate`
- 시나리오 이름: `node_max_throughput`
- rate stages: 20000, 40000, 80000 req/s
- 최대 rate: 80000 req/s
- stage duration: 1m
- 총 실행 시간: 3m
- time unit: 1s
- pre-allocated VU: 500
- max VU: 5000

## 실행 명령

```bash
k6 version
cp load/.env.example load/.env
pnpm load:01_node_capacity_limit:tps_ramp:stress
```

실행 설정은 `load/.env`에서 읽는다.
실행할 때마다 k6 `handleSummary()`가 k6 summary JSON과 Prometheus 리소스 통계 JSON을 함께 저장한다.
Grafana 필터에 사용할 k6 `testid`는 실행 시 UUID로 자동 생성되며 결과 JSON의 `test.testid`에 기록된다.

- k6 summary: `results/{YYYY-MM-DD-HHMMSS}-stress.json`
- Prometheus resources: `results/{YYYY-MM-DD-HHMMSS}-stress.resources.json`

Prometheus label 값은 `load/.env`의 `PROMETHEUS_NAMESPACE`, `PROMETHEUS_JOB`, `PROMETHEUS_POD_REGEX`로 변경한다.

목표 TPS를 더 크게 올리는 테스트는 별도 k6 스크립트 또는 별도 시나리오로 추가한다. 최대 처리량 판정은 에러율, p95 latency, k6 `dropped_iterations`, 서버 CPU/event loop lag를 함께 보고 안정적으로 유지되는 가장 높은 req/s 구간으로 잡는다.

## 성공 기준

- `http_req_failed` rate < 0.01
- `http_req_duration` p95 < 1000 ms
- threshold 실패 여부는 최종 결과에서 확인하며, 실패해도 남은 stage는 계속 진행한다.
- 대상 API 응답 status가 200이다.
- k6 `dropped_iterations`가 먼저 증가하지 않아야 서버 병목으로 해석할 수 있다.

## 결과 해석 메모

- Node CPU 사용률이 90~100%에 붙고 NIC 대역폭이 남아 있으면 Node CPU Computing 또는 Node 요청 처리 경로가 먼저 병목이다.
- NIC RX/TX가 물리 대역폭 한계에 가깝고 Node CPU가 남아 있으면 네트워크 대역폭이 먼저 병목이다.
- k6 `dropped_iterations`가 증가하고 서버 CPU/NIC가 남아 있으면 부하 발생기 한계이므로 k6 실행 노드를 늘리거나 분산 실행한다.
- 작은 JSON API는 네트워크 대역폭보다 Node 요청 처리 오버헤드가 먼저 한계에 도달할 가능성이 높다. 이 경우 “현재 API payload 조건에서는 네트워크보다 Node CPU/런타임 경로가 먼저 병목”으로 해석한다.
