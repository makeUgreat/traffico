# 01_node_capacity_limit/async_libuv 부하테스트

## 목적

libuv thread pool을 사용하는 비동기 작업에서 단일 Pod가 백그라운드 스레드로 여러 코어를 활용하는지 측정한다.

Env A-D에서 같은 스크립트를 각각 실행해 CPU request, Pod 개수, `UV_THREADPOOL_SIZE`가 libuv 기반 작업 처리량에 주는 영향을 비교한다.

## 테스트 대상

- `GET /node-capacity-limit/async-libuv?iterations=100000&keylen=32&digest=sha256`
- 기본 대상 주소: `http://localhost:3000`
- 대상 주소는 `load/.env`의 `TARGET_BASE_URLS`에 쉼표로 구분해 넣는다. URL이 하나여도 이 값을 사용한다.
- k6 스크립트는 PBKDF2 조건을 API 요청 파라미터 `iterations=100000`, `keylen=32`, `digest=sha256`로 직접 지정한다.
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
- `UV_THREADPOOL_SIZE`: 기본값 4, 별도 실험 시 배포 환경변수로 변경한다.
- 병목 판단 시 k6 `http_reqs`, p95, `dropped_iterations`, Pod CPU, CPU throttling, event loop lag를 함께 본다.

## Little's Law 예상 수치

- 목표 처리량 `λ`: needs measurement
- 목표 평균 응답 시간 `W`: needs measurement
- 예상 동시 처리량 `L = λW`: 측정된 처리량 \* 측정된 평균 응답 시간
- k6 VU 산정 근거: libuv 기본 thread pool 4개보다 충분히 큰 동시 요청을 만들기 위해 50 VU로 시작한다.

## 트래픽 조건

- stress VU: 50
- stress duration: 3m
- PBKDF2 iterations: `100000`
- PBKDF2 keylen: `32`
- PBKDF2 digest: `sha256`
- 각 VU는 `sleep()` 없이 가능한 한 빠르게 반복 요청한다.

## 실행 명령

```bash
k6 version
cp load/.env.example load/.env
pnpm load:01_node_capacity_limit:async_libuv:stress
```

실행할 때마다 k6 summary JSON과 Prometheus 리소스 통계 JSON을 `results/`에 함께 저장한다.

## 성공 기준

- `http_req_failed` rate < 0.01
- `/node-capacity-limit/async-libuv` 응답 status가 200이다.
- baseline 대비 처리량, p95, Pod CPU 사용량 차이를 기록한다.

## 결과 해석 메모

- 예상 병목은 libuv thread pool, `UV_THREADPOOL_SIZE`, Pod CPU이다.
- 단일 Pod CPU가 1 core를 넘어가면 백그라운드 thread pool이 여러 코어를 사용한 것으로 해석할 수 있다.
- `UV_THREADPOOL_SIZE`를 키운 실험은 같은 Env/API 조합에서 별도 결과 파일로 기록한다.
