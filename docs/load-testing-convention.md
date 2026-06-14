# Load Testing Convention

This project uses k6 for load testing.
Load tests are not meant to quickly verify code correctness like unit or E2E tests. They are used to validate traffic conditions and performance limits for specific scenarios.

## General Rules

- Put load testing files under the root `load/` directory.
- `test/` is only for Vitest unit tests and E2E tests.
- `load/` is only for k6 load tests, traffic models, performance criteria, infrastructure details, and execution conditions.
- Put application scenarios under `src/scenarios/`.
- Use two-digit scenario numbers. Example: `00_event_loop`
- Match the application scenario name and the load test target group name. Example: `src/scenarios/00_event_loop` and `load/scenarios/00_event_loop`
- Put shared environment variable handling and helpers under `load/common/`.
- Define thresholds in each k6 script by default because they may differ by scenario. Move thresholds to `load/common/` only when multiple scripts actually share the same criteria.
- Put actual k6 scripts under the load scenario directory for the target group.
- Put a `scenario.md` file in each leaf directory that contains k6 scripts to describe what is tested, under which conditions, and against which criteria.
- Store load test execution results under `results/` in the same leaf directory, one document per execution.

## Directory Structure

```txt
src/
  scenarios/
    00_event_loop/

load/
  common/
    env.ts
  scenarios/
    00_event_loop/
      baseline/
        scenario.md
        smoke.k6.ts
        stress.k6.ts
        results/
          2026-05-26-stress.md
      cpu_blocking/
        scenario.md
        spike.k6.ts
        results/
          2026-05-26-spike.md
```

## Common Modules

- `load/common/env.ts` contains k6 execution environment variable parsing and defaults.
- Put helpers that are actually shared across scenarios under `load/common/` with filenames that describe their purpose.
- Keep scenario-specific configuration inside the relevant scenario directory instead of promoting it to a common module.

## Scenario Scripts

- Use the `{purpose}.k6.ts` filename format so the execution purpose is clear. Examples: `smoke.k6.ts`, `stress.k6.ts`, `spike.k6.ts`
- Put k6 scripts under `load/scenarios/{target_group}/{load_scenario}/`. Example: `load/scenarios/00_event_loop/baseline/smoke.k6.ts`
- k6 scripts should express only the traffic model and request flow for the scenario.
- Import shared environment variable handling from `load/common/env.ts`.
- Define thresholds directly in each k6 script so the test intent is visible. Use a common helper only when the exact same thresholds are repeated across multiple scripts.
- Do not put long explanations or calculation rationale in the script. Put detailed context in `scenario.md` in the same directory.

## Document Roles

Separate the responsibilities of `scenario.md` and `results/*.md`.
`scenario.md` is the test design document that defines what to validate and how to validate it. `results/*.md` is the execution result document that records what actually happened when the test was run.
If the test design has not changed, do not update `scenario.md` for every run. Add a new result document under `results/` instead.

- `scenario.md`: purpose, infrastructure assumptions, test target, Little's Law estimates, traffic conditions, execution command, success criteria, and result interpretation criteria.
- `results/{YYYY-MM-DD}-{purpose}.md`: execution information, execution environment, k6 results, server metrics, result interpretation, and follow-up actions.
- `Infrastructure`: load generator, application server, runtime, deployment, external dependencies, network conditions, and observability tools needed to reproduce or compare results.

Do not guess unknown values. Leave them as `needs measurement` or `needs confirmation`.

## Templates

Use these detailed templates when writing documents.

- Scenario document: [load-testing/scenario-template.md](load-testing/scenario-template.md)
- Result document: [load-testing/result-template.md](load-testing/result-template.md)
- Infrastructure details: [load-testing/infrastructure-template.md](load-testing/infrastructure-template.md)

## Little's Law Estimates

The `Little's Law Estimates` section in `scenario.md` must include at least these values.

- Target throughput `λ`: `{n} req/s`
- Target average response time `W`: `{n} ms`
- Expected concurrency `L = λW`: `{n}`
- k6 VU sizing rationale: `{calculation and reason for the selected VU count}`

Little's Law is a baseline for estimating load targets.
Interpret actual results using both k6 metrics and server metrics.

## Execution Commands

Add load test execution commands as `package.json` scripts.

```json
{
  "scripts": {
    "load:00_event_loop:baseline:smoke": "k6 run load/scenarios/00_event_loop/baseline/smoke.k6.ts"
  }
}
```

When adding scenarios or execution purposes, use the `load:{target_group}:{load_scenario}:{purpose}` format.

## Structure Checklist

- [ ] Are load tests separated under `load/` and Vitest tests under `test/`?
- [ ] Does each application scenario use the `src/scenarios/{two_digit_name}/` format?
- [ ] Is each k6 script under `load/scenarios/{target_group}/{load_scenario}/`, and does `target_group` correspond to the application scenario name?
- [ ] Are shared environment variable handling and actual shared helpers under `load/common/`, and are thresholds defined in scripts according to each test purpose?
- [ ] Does each leaf directory containing k6 scripts have a `scenario.md`?
- [ ] Does each scenario document include purpose, test target, infrastructure, Little's Law estimates, traffic conditions, execution command, success criteria, and result interpretation criteria?
- [ ] Does the infrastructure section include load generator, application server, runtime settings, deployment model, external dependencies, network conditions, and observability tools?
- [ ] Do Little's Law estimates include `λ`, `W`, `L = λW`, and the k6 VU sizing rationale?
- [ ] After running a load test, is the result separated into a `results/{YYYY-MM-DD}-{purpose}.md` document?
- [ ] Does each result document include execution information, execution environment, k6 results, server metrics, result interpretation, and follow-up actions?
