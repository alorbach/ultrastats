# CSP staging for operators

UltraStats does not send `Content-Security-Policy` from PHP by default. Use this short checklist when hardening at the **reverse proxy** or **web server** (see [SECURITY.md](../SECURITY.md) Content-Security-Policy section). For TLS, secrets, and other go-live items, see [maintainer-deployment.md](maintainer-deployment.md).

## 1. Report-Only first

1. Add **`Content-Security-Policy-Report-Only`** (not the enforcing header) with a policy you expect to need, e.g. `default-src 'self'`, relaxed `script-src` / `style-src` if you use inline assets.
2. Load **public** pages and **admin** pages (including `admin/upgrade.php`, parser, string editor).
3. Use browser DevTools (Console / Issues) or your `report-uri` / `report-to` endpoint to collect violations.
4. Adjust the policy or fix templates/scripts until reports are acceptable.

## 2. Enforce

1. When Report-Only is clean enough for your risk tolerance, add **`Content-Security-Policy`** with the same (or tighter) directives.
2. Re-test both **front** and **admin** UIs; legacy inline handlers and scripts may require `'unsafe-inline'` until a UI pass removes them.

## 3. Optional: route-specific policies

Stricter policies on static or low-interaction paths, and looser on admin, is valid if your server supports per-`location` / per-directory headers. Document any split so future changes are traceable.

## 4. Non-goals here

- No requirement to add CSP in application PHP; proxy config is preferred.
- Nonces/hashes for inline script are a **follow-up** after reducing inline script in templates (see `docs/ui-compatibility-review.md` if present).
