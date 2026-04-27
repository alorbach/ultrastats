# Maintainer / operator deployment duties

This document lists hosting and production concerns that **maintainers and operators** own. It is not a developer checklist for the application source tree.

## HTTPS / TLS

- Terminate **TLS** (HTTPS) at your reverse proxy, load balancer, or web server; obtain and renew certificates (e.g. Let’s Encrypt or your CA).
- Prefer serving the site and especially **`admin/`** over HTTPS in production so credentials and session cookies are not sent in cleartext.
- The PHP app sets the session cookie **`Secure`** when it detects an HTTPS request (`$_SERVER['HTTPS']` / forwarded scheme). That only helps if users actually reach the app over HTTPS.

## Other production concerns

| Area | Maintainer responsibility |
|------|---------------------------|
| **Secrets** | Do not deploy `config.php` from VCS with real passwords; use strong DB credentials; restrict file permissions. |
| **PHP** | Production `php.ini`: e.g. `display_errors=Off`, sensible `log_errors` and error log path. |
| **Admin exposure** | Restrict `admin/` if the app is internet-facing (VPN, IP allowlist, extra auth, or private network). |
| **Debug** | Turn off in-app debug / verbose options in production (e.g. config flags such as `ShowDebugMsg` / `gen_phpdebug` where applicable). |
| **CSP** | Optional hardening: staged **Content-Security-Policy** at the proxy; see [csp-staging.md](csp-staging.md) and [SECURITY.md](../SECURITY.md) (CSP section). |

## See also

- [SECURITY.md](../SECURITY.md) — hardening implemented in code and SQL surface notes.
