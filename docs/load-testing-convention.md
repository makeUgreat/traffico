# 부하테스트 컨벤션

이 프로젝트는 k6를 사용해 부하테스트를 작성한다. 부하테스트는 유닛 테스트나 E2E 테스트처럼 코드의 정확성을 빠르게 검증하는 목적이 아니라, 특정 시나리오에서 트래픽 조건과 성능 한계를 확인하는 목적이다.

## 공통 규칙

- 부하테스트 파일은 루트의 `load/` 아래에 둔다.
- `test/`는 Vitest 기반 유닛 테스트와 E2E 테스트만 담당한다.
- `load/`는 k6 기반 부하테스트, 트래픽 모델, 성능 기준, 인프라 구성과 실행 조건 설명만 담당한다.
- 애플리케이션 시나리오는 `src/scenarios/` 아래에 둔다.
- 시나리오 번호는 두 자리 숫자를 사용한다. 예: `00_event_loop`
- 애플리케이션 시나리오 이름과 부하테스트 대상 그룹 이름을 맞춘다. 예: `src/scenarios/00_event_loop`와 `load/scenarios/00_event_loop`
- 여러 시나리오가 공유하는 설정, threshold, 환경 변수 처리, helper는 `load/common/`에 둔다.
- 실제 k6 스크립트는 대상 그룹 아래의 부하 시나리오 디렉터리에 둔다.
- k6 스크립트가 있는 leaf 디렉터리에는 `README.md`를 두어 무엇을 어떤 조건과 환경에서 테스트하는지 명시한다.

## 디렉터리 구조

```txt
src/
  scenarios/
    00_event_loop/

load/
  common/
    config.ts
    thresholds.ts
    env.ts
  scenarios/
    00_event_loop/
      README.md
      baseline/
        README.md
        smoke.k6.ts
        stress.k6.ts
      cpu_blocking/
        README.md
        spike.k6.ts
```

## 공통 모듈

- `load/common/config.ts`에는 base URL, 기본 k6 옵션, 공통 timeout처럼 여러 시나리오가 공유하는 설정을 둔다.
- `load/common/thresholds.ts`에는 공통 threshold 또는 threshold 생성 helper를 둔다.
- `load/common/env.ts`에는 k6 실행 환경 변수 파싱과 기본값 처리를 둔다.
- 특정 시나리오에만 필요한 설정은 공통 모듈로 올리지 않고 해당 시나리오 디렉터리에 둔다.

## 시나리오 스크립트

- 파일명은 실행 목적이 드러나도록 `{purpose}.k6.ts` 형식을 사용한다. 예: `smoke.k6.ts`, `stress.k6.ts`, `spike.k6.ts`
- k6 스크립트는 `load/scenarios/{target_group}/{load_scenario}/` 아래에 둔다. 예: `load/scenarios/00_event_loop/baseline/smoke.k6.ts`
- k6 스크립트는 해당 시나리오의 트래픽 모델과 요청 흐름만 표현한다.
- 공통 URL, header, threshold, 환경 변수 처리는 `load/common/`에서 가져온다.
- 스크립트 안에는 테스트 의도나 계산 근거를 길게 적지 않고, 자세한 설명은 같은 디렉터리의 `README.md`에 둔다.

## 시나리오 README

각 `load/scenarios/{target_group}/{load_scenario}/README.md`는 최소한 아래 구조를 따른다.

```md
# {target_group}/{load_scenario} 부하테스트

## 목적
## 테스트 대상
## 인프라 구성
## Little's Law 예상 수치
## 트래픽 조건
## 실행 명령
## 성공 기준
## 결과 해석 메모
```

- `목적`: 어떤 성능 특성이나 병목을 확인하는지 적는다.
- `테스트 대상`: API, 모듈, 라우트, 대상 endpoint를 명시한다.
- `인프라 구성`: 테스트 당시의 서버, 컨테이너, CPU, 메모리, replica 수, DB, 캐시, 네트워크처럼 결과에 영향을 줄 수 있는 구성을 적는다.
- `Little's Law 예상 수치`: `L = λW` 기준으로 목표 처리량, 평균 응답 시간, 예상 동시성 또는 VU 산정 근거를 적는다.
- `트래픽 조건`: VU, duration, ramping, arrival rate 등 실제 k6 옵션과 Little's Law 계산값의 관계를 적는다.
- `실행 명령`: 해당 시나리오를 실행하는 명령을 적는다.
- `성공 기준`: threshold와 기대 응답 상태를 적는다.
- `결과 해석 메모`: 병목 판단 기준, 관찰할 metric, 주의사항을 적는다.

## Little's Law 예상 수치

시나리오 README의 `Little's Law 예상 수치` 섹션에는 최소한 아래 값을 포함한다.

```md
## Little's Law 예상 수치

- 목표 처리량 `λ`: {n} req/s
- 목표 평균 응답 시간 `W`: {n} ms
- 예상 동시 처리량 `L = λW`: {n}
- k6 VU 산정 근거: {계산값과 실제 VU 선택 이유}
```

예:

```md
## Little's Law 예상 수치

- 목표 처리량 `λ`: 100 req/s
- 목표 평균 응답 시간 `W`: 200 ms = 0.2 s
- 예상 동시 처리량 `L = λW`: 100 * 0.2 = 20
- k6 VU 산정 근거: 이론상 동시성은 20이므로 여유를 두어 30 VU로 시작한다.
```

Little's Law는 부하 목표를 산정하기 위한 기준값이다. 실제 결과는 k6 metric과 서버 metric을 함께 보고 해석한다.

## 실행 명령

부하테스트 실행 명령은 `package.json`의 script로 추가한다.

```json
{
  "scripts": {
    "load:00_event_loop:baseline:smoke": "k6 run load/scenarios/00_event_loop/baseline/smoke.k6.ts"
  }
}
```

시나리오나 실행 목적이 늘어나면 `load:{target_group}:{load_scenario}:{purpose}` 형식으로 추가한다.

## 구조 체크리스트

- [ ] 부하테스트는 `load/`, Vitest 테스트는 `test/`로 분리되어 있는가?
- [ ] 애플리케이션 시나리오가 `src/scenarios/{two_digit_name}/` 형식인가?
- [ ] k6 스크립트가 `load/scenarios/{target_group}/{load_scenario}/` 아래에 있고, `target_group`이 애플리케이션 시나리오 이름과 대응되는가?
- [ ] 공통 설정, threshold, 환경 변수 처리가 `load/common/`에 있는가?
- [ ] k6 스크립트가 있는 leaf 디렉터리에 `README.md`가 있는가?
- [ ] 시나리오 README에 목적, 테스트 대상, 인프라 구성, Little's Law 예상 수치, 트래픽 조건, 실행 명령, 성공 기준, 결과 해석 메모가 있는가?
- [ ] Little's Law 예상 수치에 `λ`, `W`, `L = λW`, k6 VU 산정 근거가 있는가?
