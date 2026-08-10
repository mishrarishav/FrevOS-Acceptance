# Acceptance Environment Contract

## Variables

| Variable | Required | Allowed values | Default | Sensitivity |
| --- | --- | --- | --- | --- |
| `FREVOS_TARGET_ENV` | No | `fixture`, `preview`, `uat` | `fixture` | Non-secret |
| `FREVOS_BASE_URL` | For preview/uat | Absolute HTTP(S) URL under the rules below | Loopback fixture URL | Non-secret, but may reveal infrastructure |

The harness accepts no credential, token, password, storage-state, or secret
environment variable in Phase 2.

## Validation rules

- `fixture` must use HTTP, the root path, an explicit unprivileged port, and a
  loopback hostname: `127.0.0.1`, `localhost`, or `::1`.
- `preview` and `uat` require HTTPS.
- Production is not an accepted target class.
- URLs with embedded username/password credentials, query strings, fragments,
  or non-HTTP protocols fail before browser launch.
- A missing preview/uat URL fails before browser launch.
- Invalid input errors describe the rule and do not echo the supplied URL.

The default command launches the synthetic fixture at
`http://127.0.0.1:4173/`. The fixture is a harness self-test only. It is not a
FrevOS preview and produces no product acceptance evidence.

## External target execution

Defining a preview/uat contract does not authorize network access to a target.
Each external run must identify the approved environment and immutable release
or source identity, confirm that synthetic non-sensitive test data is allowed,
and record the exact command and evidence boundary.

Product-facing tests must remain absent until the relevant approved public
behavior exists. Phase 3 additionally requires the exact Lovable reference and
screen contract before UI acceptance specifications are written.
