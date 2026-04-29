# Maintainer docs index

Operational and deep-dive documentation that supplements [README.md](../README.md), [AGENTS.md](../AGENTS.md), and [SECURITY.md](../SECURITY.md).

## Documents in this folder

- [maintainer-deployment.md](maintainer-deployment.md) — production hosting responsibilities (TLS, admin exposure, logging, backups, secrets).
- [csp-staging.md](csp-staging.md) — staged Content-Security-Policy rollout at the proxy/web-server layer.
- [prepared-statements-surface.md](prepared-statements-surface.md) — SQL surface inventory used to prioritize hardening.
- [ui-compatibility-review.md](ui-compatibility-review.md) — static UI audit record for a future frontend refresh.
- [frontend-admin-modernization-progress.md](frontend-admin-modernization-progress.md) — summary of compatibility-safe frontend/admin UI work; enforced detail lives in `e2e/tests/frontend-admin-smoke.spec.ts` and git history.

## Agent playbooks

Assistant skills moved to the repository root under [`.agent/`](../.agent/README.md) (see [`.agent/skills/`](../.agent/skills/summarize-handoff.md)).

## Credits

- Release testing support: [David Sanetti](https://github.com/davemx85).
