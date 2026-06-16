# 01_node_capacity_limit/baseline 부하테스트

## 목적

Node.js 애플리케이션이 별도 작업 없이 작은 JSON 응답을 반환할 때의 HTTP 기본 처리량을 측정한다.

Env A-D에서 같은 스크립트를 각각 실행해 CPU request와 Pod 개수 변화가 기본 요청 처리량에 주는 영향을 비교한다.

## 테스트 대상

- `GET /node-capacity-limit/baseline`
- 기본 대상 주소: `http://localhost:3000`
- 대상 주소는 `load/.env`의 `TARGET_BASE_URLS`에 쉼표로 구분해 넣는다. URL이 하나여도 이 값을 사용한다.
- 정상 응답 body는 다른 API와 동일한 `{"status":"ok"}`로 유지한다.

## 인프라 구성

- 실행 위치: 로컬 개발 머신 또는 k6 전용 부하 발생 노드
- 대상 서버: Kubernetes 배포 환경의 traffico 서버
- Node 런타임: Node v24.15.0 LTS
- k6 실행기: 로컬 또는 내부망 부하 발생 서버
- Env A: 노드별 1 pod, CPU request 미설정, CPU limit 미설정
- Env B: 노드별 1 pod, CPU request `1000m`, CPU limit 미설정
- Env C: 노드별 1 pod, CPU request `500m`, CPU limit 미설정
- Env D: 노드별 2 pods, CPU request `500m`, CPU limit 미설정
- 병목 판단 시 k6 `http_reqs`, p95, `dropped_iterations`, Pod CPU, CPU throttling, event loop lag를 함께 본다.

## Little's Law 예상 수치

- 목표 처리량 `λ`: needs measurement
- 목표 평균 응답 시간 `W`: 100 ms = 0.1 s
- 예상 동시 처리량 `L = λW`: 측정된 처리량 \* 0.1
- k6 VU 산정 근거: Env A-D와 다른 API를 같은 조건으로 비교하기 위해 기본 50 VU로 시작한다.

## 트래픽 조건

- stress VU: 50
- stress duration: 3m
- 각 VU는 `sleep()` 없이 가능한 한 빠르게 반복 요청한다.

## 실행 명령

```bash
k6 version
cp load/.env.example load/.env
pnpm load:01_node_capacity_limit:baseline:stress
```

실행할 때마다 k6 summary JSON과 Prometheus 리소스 통계 JSON을 `results/`에 함께 저장한다.

## 성공 기준

- `http_req_failed` rate < 0.01
- `/node-capacity-limit/baseline` 응답 status가 200이다.
- k6 `dropped_iterations`가 먼저 증가하지 않아야 서버 병목으로 해석할 수 있다.

## 결과 해석 메모

- 주요 비교값은 RPS, p95, Pod CPU, CPU throttling이다.
- 이 결과는 `/cpu-bound`, `/async-io`, `/async-libuv` 결과를 해석하기 위한 기준선이다.
