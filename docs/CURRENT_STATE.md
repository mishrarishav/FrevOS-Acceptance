# FrevOS Acceptance Current State

Last updated: 2026-08-10

## Snapshot

| Item | Observed state |
| --- | --- |
| Repository | `https://github.com/mishrarishav/FrevOS-Acceptance` |
| Default branch | `main` |
| Phase branch | `phase/2-independent-acceptance-harness` |
| Base commit | `9d8c073ec51f61f65f63885945afb811fe22d60d` |
| Active phase | Phase 2 — independent acceptance harness |
| Production source dependency | None; prohibited by policy and validation |
| Product-facing specifications | None; Phase 3 UI contract is not yet approved |
| Harness target | Deterministic loopback fixture |
| External target classes | HTTPS `preview` and `uat` contracts defined but not exercised |
| Production target | Prohibited |
| Desktop/mobile coverage | Desktop Chrome and Pixel 7 Chromium emulation prepared |
| Accessibility | axe-core WCAG A/AA scan prepared |
| CI | Read-only, pinned GitHub Actions workflow prepared on the phase branch |
| Phase 2 publication | Dedicated-branch pull request and human merge required; Phase 2 remains unmerged |
| Branch protection | Active `Protect main` ruleset `20623785` targets the default branch and prevents deletion and force pushes; pull requests are squash-only, conversation resolution is required, and the stable `validate` check is intentionally deferred until a successful `main` run |

## Phase 2 deliverables

The phase branch establishes:

- independent repository and change-governance instructions;
- Node.js 24, pnpm 11, TypeScript 7, Playwright 1.62, axe-core, and Biome;
- validated environment and target boundaries;
- a synthetic black-box fixture that is not a FrevOS UI prototype;
- desktop/mobile responsive, semantic, console, network-failure, and automated
  accessibility harness checks;
- failure screenshot, trace, video, HTML, JSON, and JUnit evidence;
- deterministic checks against production coupling and common test-weakening
  mechanisms;
- read-only CI, immutable Action references, bounded artifact retention,
  dependency proposals, and dependency audit;
- desired merge rules for squash-only, conversation resolution, force/deletion
  prevention, and a stable up-to-date validation check.

## Explicit exclusions

Phase 2 does not implement or claim:

- FrevOS UI screens or product behavior;
- authentication or credential handling;
- workspace-isolation, approval, audit, deployment, or unauthorized-tool product
  tests before those capabilities exist;
- Production execution;
- Firefox, WebKit, or physical-device coverage;
- visual baselines derived without the approved Phase 3 design source;
- required-check activation before the first successful default-branch CI run.

## Exit rule

Phase 2 is complete only after the full local validation passes, the complete
diff and generated synthetic evidence are reviewed, the authorized pull request
check succeeds for its exact head SHA, the human owner squash-merges, default
branch CI succeeds, and the stable `validate` check is added to an active
`Protect main` ruleset without bypass actors.

Phase 3 must then pause before UI implementation until the product owner
provides the exact Lovable source, commit SHA, screen and interaction contract,
responsive behavior, design tokens, and acceptance criteria.
