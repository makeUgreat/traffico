# 02_event_loop/cpu_blocking 부하테스트

## 목적

CPU intensive 작업이 Node 메인 스레드를 점유해 이벤트 루프를 막을 때 처리량이 baseline 대비 얼마나 떨어지는지 확인한다.

## 테스트 대상

- `GET /event-loop/cpu-blocking?ms={CPU_BLOCK_MS}`
- 기본 대상 주소: `http://localhost:3000`
- 대상 주소는 `BASE_URL` 환경 변수로 변경한다.
- 정상 응답 body는 baseline과 동일한 `{"status":"ok"}`로 유지해 응답 크기 조건을 통제한다.

## 인프라 구성

- 실행 위치: 로컬 개발 머신
- 대상 서버: `pnpm start:dev` 또는 `pnpm start`로 실행한 traffico 서버
- k6 실행기: 로컬에 설치된 k6 v1.4.0
- 단일 Node 프로세스의 이벤트 루프 blocking 특성을 관찰한다.

## Little's Law 예상 수치

- 목표 처리량 `λ`: 20 req/s
- 목표 평균 응답 시간 `W`: 50 ms = 0.05 s
- 예상 동시 처리량 `L = λW`: 20 \* 0.05 = 1
- k6 VU 산정 근거: 50ms CPU blocking이면 단일 이벤트 루프에서 이론상 최대 약 20 req/s이므로, 병목을 충분히 만들기 위해 기본 50 VU로 시작한다.

## 트래픽 조건

- stress VU: 50
- stress duration: 1m
- CPU blocking 시간: 50 ms
- 각 VU는 `sleep()` 없이 가능한 한 빠르게 반복 요청한다.

## 실행 명령

```bash
k6 version
BASE_URL=http://localhost:3000 pnpm load:02_event_loop:cpu_blocking:stress
```

## 성공 기준

- `http_req_failed` rate < 0.01
- `/event-loop/cpu-blocking` 응답 status가 200이다.
- baseline stress 결과와 비교해 `http_reqs` rate 감소폭을 기록한다.

## 결과 해석 메모

- 이 테스트의 핵심 지표는 threshold 통과 여부보다 baseline 대비 `http_reqs/s` 감소폭이다.
- CPU blocking 시간을 키우면 단일 이벤트 루프의 이론상 최대 처리량은 대략 `1000 / blocking_ms` req/s로 낮아진다.
- 응답 body는 baseline과 동일하므로 주요 차이는 CPU blocking 작업이다.
