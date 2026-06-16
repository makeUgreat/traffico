# 01_node_capacity_limit/cpu_bound 부하테스트

## 목적

JS 메인 스레드에서 동기 CPU 계산을 수행할 때 단일 Node.js 프로세스의 CPU 한계를 측정한다.

Env A-D에서 같은 스크립트를 각각 실행해 CPU request와 Pod 개수 변화가 메인 스레드 병목에 주는 영향을 비교한다.

## 테스트 대상

- `GET /node-capacity-limit/cpu-bound?ms=50`
- 기본 대상 주소: `http://localhost:3000`
- 대상 주소는 `load/.env`의 `TARGET_BASE_URLS`에 쉼표로 구분해 넣는다. URL이 하나여도 이 값을 사용한다.
- k6 스크립트는 CPU 작업 시간을 API 요청 파라미터 `ms=50`으로 직접 지정한다.
- 정상 응답 body는 baseline과 동일한 `{"status":"ok"}`로 유지한다.

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

- 목표 처리량 `λ`: 20 req/s
- 목표 평균 응답 시간 `W`: 50 ms = 0.05 s
- 예상 동시 처리량 `L = λW`: 20 \* 0.05 = 1
- k6 VU 산정 근거: 50 ms CPU 작업이면 단일 이벤트 루프의 이론상 최대 처리량은 약 20 req/s이므로 병목을 충분히 만들기 위해 50 VU로 시작한다.

## 트래픽 조건

- stress VU: 50
- stress duration: 3m
- CPU 작업 시간: `ms=50`
- 각 VU는 `sleep()` 없이 가능한 한 빠르게 반복 요청한다.

## 실행 명령

```bash
k6 version
cp load/.env.example load/.env
pnpm load:01_node_capacity_limit:cpu_bound:stress
```

실행할 때마다 k6 summary JSON과 Prometheus 리소스 통계 JSON을 `results/`에 함께 저장한다.

## 성공 기준

- `http_req_failed` rate < 0.01
- `/node-capacity-limit/cpu-bound` 응답 status가 200이다.
- baseline 대비 `http_reqs` rate 감소폭을 기록한다.

## 결과 해석 메모

- 예상 병목은 Node.js 메인 JS 스레드이다.
- Env D에서 처리량이 증가하면 노드당 Node.js 프로세스 수 증가 효과로 해석한다.
- CPU limit이 없으므로 throttling은 낮아야 하며, throttling이 높으면 배포 설정이나 노드 상태를 확인한다.
