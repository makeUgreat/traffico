# Traffico

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Runtime | Node.js | 24.15.0 LTS |
| Framework | NestJS | 11.1.21 |
| HTTP | Fastify (`@nestjs/platform-fastify`) | 11.1.21 |
| Language | TypeScript | 5.9.3 |
| Build | SWC | 1.15.33 |
| Test | Vitest | 4.1.6 |
| Load Test | k6 | 1.4.0 |
| Lint | ESLint | 9.39.4 |
| Formatter | Prettier | 3.8.3 |
| Package Manager | pnpm | 10.19.0 |

## Scripts

```bash
pnpm start:dev      # 개발 서버 (watch 모드)
pnpm build          # SWC 빌드
pnpm typecheck      # TypeScript 타입 체크
pnpm test           # 유닛 테스트
pnpm test:e2e       # E2E 테스트
pnpm test:watch     # 테스트 watch 모드
pnpm test:cov       # 테스트 커버리지
pnpm lint           # ESLint
pnpm format         # Prettier
```

## Load Tests

로컬에서 부하테스트를 실행하려면 개발자 머신에 k6 CLI가 설치되어 있어야 한다.

```bash
k6 version          # expected: k6 v1.4.0
```

macOS에서는 Homebrew로 설치한다.

```bash
brew install k6
```
