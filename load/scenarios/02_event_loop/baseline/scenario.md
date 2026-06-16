# 02_event_loop/baseline 부하테스트

## 목적

CPU blocking 시나리오와 비교할 정상 요청 처리량을 측정한다.

## 테스트 대상

- `GET /event-loop/baseline`
- 기본 대상 주소: `http://localhost:3000`
- 대상 주소는 `load/.env`의 `TARGET_BASE_URL`로 변경한다.
- 정상 응답 body는 CPU blocking API와 동일한 `{"status":"ok"}`로 유지한다.

## 인프라 구성

- 실행 위치: 로컬 개발 머신
- 대상 서버: `pnpm start:dev` 또는 `pnpm start`로 실행한 traffico 서버
- k6 실행기: 로컬에 설치된 k6 v1.4.0
- 추후 내부망 부하 발생 서버에서는 같은 스크립트를 별도 k6 Pod 또는 k6 전용 이미지에서 실행한다.

## Little's Law 예상 수치

- 목표 처리량 `λ`: baseline 최대 처리량 관찰
- 목표 평균 응답 시간 `W`: 200 ms = 0.2 s
- 예상 동시 처리량 `L = λW`: 실제 측정된 처리량 \* 0.2
- k6 VU 산정 근거: CPU blocking 시나리오와 같은 기본 50 VU로 비교한다.

## 트래픽 조건

- stress VU: 50
- stress duration: 3m
- stress는 `/event-loop/baseline`을 `sleep()` 없이 가능한 한 빠르게 반복 요청한다.

## 실행 명령

```bash
k6 version
cp load/.env.example load/.env
pnpm load:02_event_loop:baseline:stress
```

## 성공 기준

- `http_req_failed` rate < 0.01
- `/event-loop/baseline` 응답 status가 200이다.

## 결과 해석 메모

- CPU blocking 시나리오와 비교하기 위한 baseline 처리량 측정용이다.
- p95가 200ms를 넘으면 서버 기동 상태, 로컬 머신 부하, 네트워크 경로를 먼저 확인한다.
