# Acceptance Evidence Policy

## Evidence produced

Every Playwright run produces console output plus:

- an HTML report for human inspection;
- JSON results for deterministic tooling;
- JUnit XML for CI interoperability;
- per-test attachments such as sanitized harness context and axe violations;
- screenshots only on failure;
- traces and video retained only on failure.

The synthetic fixture run identifies itself as `productAcceptance: false`.
Passing it proves runner capabilities, not FrevOS behavior.

## Storage and retention

Local output belongs under ignored `artifacts/` and `playwright-report/`
directories. GitHub CI uploads only those two paths and retains the artifact for
seven days. Longer retention needs an explicit data and access review.

Do not commit generated evidence. A pull request should link its GitHub Actions
run and summarize results rather than copy reports into the repository.

## Sensitive-data controls

- Use synthetic users, workspaces, repositories, messages, and identifiers.
- Never include passwords, session cookies, bearer tokens, API keys, customer
  content, or Production data in browser state or target input.
- Review failure screenshots, traces, videos, network metadata, console output,
  and attachments before sharing them.
- Do not upload evidence from an unauthorized target.
- Stop and report privately if evidence unexpectedly contains sensitive data.

Binary browser evidence cannot be made safe by a text-log redaction claim. The
primary control is preventing sensitive values from entering the run.

## Interpretation

A green result is evidence only for the named target, source/release identity,
browser project, test revision, and run time. Flaky retries, missing projects,
skipped tests, stale target identity, or incomplete artifacts must remain
visible and cannot be summarized as a clean acceptance pass.
