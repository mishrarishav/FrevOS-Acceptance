# Acceptance Test Integrity

## Authority for behavior

Acceptance assertions derive from approved product behavior, public interface
contracts, accessibility semantics, and the Phase 3 screen contract when it
exists. Production implementation details are not an authority for weakening a
test.

## Prohibited weakening

Repository validation rejects common concealment mechanisms in test sources:

- skipped, fixed, or focused tests and suites;
- arbitrary timeout sleeps;
- forced browser interactions;
- non-blocking soft assertions;
- weak existence-only assertions.

Playwright also runs with zero retries and a custom reporter that turns any
runtime-skipped test into a failed run. A flaky or dynamically skipped result
therefore cannot satisfy CI merely because source scanning missed its syntax.

Blind snapshot regeneration, threshold relaxation, broader selectors, retry
increases, removed browser projects, and reduced evidence capture are also
prohibited unless an acceptance-specific review proves the approved behavior
is unchanged and the resulting test is equivalent or stronger.

## Selector hierarchy

Prefer selectors in this order:

1. accessible role and approved name;
2. associated label or placeholder when it is part of the behavior contract;
3. visible text with stable product meaning;
4. an approved stable test ID that describes behavior rather than layout.

Avoid CSS structure, DOM depth, generated classes, implementation component
names, and XPath. A selector change must cite the approved contract change.

## Review boundary

Production implementation and acceptance maintenance require separate tasks and
pull requests. An AI QA agent may propose a maintenance patch, but a human must
verify that intended behavior is unchanged, assertion strength is equivalent or
greater, desktop/mobile/accessibility impact is covered, and failure evidence is
still captured.

The Phase 2 synthetic fixture tests validate the harness. They must never be
renamed or presented as FrevOS product specifications.
