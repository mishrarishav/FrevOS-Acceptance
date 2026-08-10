# FrevOS Acceptance

Independent black-box acceptance and evidence harness for
[FrevOS](https://github.com/mishrarishav/FrevOS).

## Current status

This repository is in **Phase 2: independent acceptance harness**. It validates
the Playwright runner itself against a synthetic fixture on desktop and mobile
Chromium. It does not claim that FrevOS product behavior exists or passes.

Product-facing specifications begin only after the Phase 3 UI reference and
screen contract are approved. Later specifications may exercise FrevOS only
through browser-visible behavior, public HTTP APIs, or explicitly approved test
interfaces. This repository never imports production source code.

## Foundation capabilities

- pinned Node.js, pnpm, TypeScript, Playwright, axe-core, and Biome versions;
- desktop and mobile browser projects;
- semantic, responsive, accessibility, console-error, and network-failure
  harness checks;
- screenshots, traces, and video retained on failure;
- line, HTML, JSON, and JUnit reports;
- strict environment validation with no Production or credential support;
- deterministic checks against skipped, focused, weakened, or production-bound
  acceptance tests;
- read-only, commit-pinned GitHub Actions CI.

## Quick start

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm run ci
```

See [Contributing](CONTRIBUTING.md), [Environment Contract](docs/ENVIRONMENT_CONTRACT.md),
[Evidence Policy](docs/EVIDENCE_POLICY.md), [Test Integrity](docs/TEST_INTEGRITY.md),
and [Current State](docs/CURRENT_STATE.md).
