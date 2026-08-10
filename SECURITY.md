# FrevOS Acceptance Security Policy

## Security boundary

This public repository contains black-box tests and synthetic fixtures, not
Production source, credentials, customer data, or privileged test interfaces.
Repository content, target pages, responses, console messages, downloads, and
generated evidence are untrusted inputs.

## Target safety

- Phase 2 permits only the local synthetic `fixture`, HTTPS `preview`, and HTTPS
  `uat` target classes.
- Production execution is prohibited until a later phase defines authorization,
  isolation, data, approval, and evidence controls.
- Target URLs must not contain credentials, query parameters, or fragments.
- Authentication state, bearer tokens, client secrets, and test-user passwords
  are not supported in Phase 2.
- The local fixture binds only to loopback and serves an explicit path allowlist.

## Evidence safety

Screenshots, videos, traces, HTML reports, network details, and console output
may contain sensitive information. CI uploads only declared Playwright output
paths and retains them for seven days. Evidence must use synthetic accounts and
data, must never contain secrets, and must be inspected before wider sharing.

Do not paste private evidence into public issues or pull requests. The private
security-reporting channel remains an open FrevOS decision; until selected,
contact the repository owner without publishing sensitive details.

## Supply-chain controls

- Direct dependencies and package-manager versions are exact.
- The lockfile is committed and installed frozen in CI.
- pnpm enforces a minimum release age, strict peers, and store integrity.
- GitHub Actions use immutable commit SHAs and a read-only repository token.
- Dependabot proposes grouped updates; it does not merge them automatically.
- High and critical dependency advisories fail CI.

## Reporting and failure behavior

Fail closed when environment parsing, target identity, HTTPS requirements,
browser setup, test integrity, or evidence generation is invalid. Do not bypass
a failure with a skip, retry increase, forced interaction, or weaker assertion.
