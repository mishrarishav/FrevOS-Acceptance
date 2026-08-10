# ADR 0001: Use an independent black-box Playwright harness

- Status: Accepted
- Date: 2026-08-09

## Context

FrevOS needs independent evidence that user-visible behavior works across
desktop/mobile, accessibility, network failures, and later security boundaries.
If production implementation can import, rewrite, skip, or silently relax the
acceptance suite, a passing result does not provide independent confidence.

Phase 2 precedes the approved UI and runtime. It must prove the harness without
inventing product behavior or coupling tests to nonexistent implementation.

## Decision

- Keep `mishrarishav/FrevOS-Acceptance` as a separate repository with no
  production source or workspace dependency.
- Use Playwright Test with TypeScript, desktop Chrome, Pixel 7 Chromium
  emulation, axe-core accessibility scans, and deterministic failure evidence.
- Validate the harness against a small loopback-only synthetic fixture that is
  explicitly not FrevOS product acceptance evidence.
- Permit only fixture, HTTPS preview, and HTTPS UAT target contracts in Phase 2.
- Prohibit credentials and Production execution until later approved controls.
- Enforce test-integrity patterns, exact dependencies, read-only pinned CI, and
  short evidence retention.

## Consequences

- Harness configuration and evidence behavior can be tested before the product
  UI exists.
- Product acceptance specifications remain blocked on approved public behavior
  and the Phase 3 UI reference.
- Chromium emulation does not prove Firefox, WebKit, or physical-device behavior;
  those additions require evidence and cost review.
- Automated axe scans catch many but not all accessibility failures; keyboard,
  screen-reader, and human review remain necessary later.
- Separate repository permissions and reviews are required to preserve the
  independence boundary.

## Rejected alternatives

- Placing Playwright tests inside the FrevOS production monorepo.
- Importing production components or test utilities.
- Creating speculative UI tests before an approved screen contract exists.
- Calling a synthetic-fixture pass a FrevOS product acceptance pass.
- Enabling Production or credential-bearing browser runs in Phase 2.
