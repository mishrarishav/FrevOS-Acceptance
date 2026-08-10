# Contributing to FrevOS Acceptance

## Change boundary

Every change needs one acceptance-specific branch and a pull request to `main`.
Production changes and acceptance changes must use separate requests, branches,
commits, reviews, and evidence.

Before changing a test, record:

- the approved behavior or interface that authorizes the change;
- whether the assertion is new, equivalent, or stronger;
- selector-contract changes and their source;
- desktop, mobile, accessibility, console, and failure-state impact;
- exact validation and generated evidence.

Do not use skips, focused tests, arbitrary sleeps, forced interactions, broad
snapshot replacement, or reduced assertions as maintenance shortcuts.

## Local validation

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm run ci
```

The final pull request must include the exact head SHA, changed-file list, diff
stat, test result, evidence paths, security review, limitations, and excluded
behavior. Only the human repository owner may squash merge while automation and
human work share one GitHub identity.
