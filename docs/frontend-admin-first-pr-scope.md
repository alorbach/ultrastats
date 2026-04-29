# Frontend/Admin Modernization: First PR Scope

## Proposed PR title

`Add frontend/admin compatibility baseline tests and modernization guardrails`

## Objective

Create a non-invasive safety baseline that enables incremental modernization without breaking legacy behavior.

## In-scope changes

- Add compatibility contract documentation:
  - `docs/frontend-admin-compatibility-contract.md`
- Add security slice planning doc:
  - `docs/frontend-admin-security-slice.md`
- Add template modernization priority map:
  - `docs/frontend-admin-template-priority.md`
- Add baseline smoke tests:
  - `e2e/tests/frontend-admin-smoke.spec.ts`
- Include one surgical no-visual-change bug fix where confidence is high.

## Out-of-scope changes

- CSS redesign.
- HTML5 conversion across all templates.
- Framework adoption.
- Broad JS rewrites.
- Parser protocol changes.

## Acceptance criteria

- Existing install E2E passes.
- New smoke spec passes in install-e2e stack.
- No URL/form/query compatibility regressions.
- No visual redesign.

## Suggested follow-up issues

1. Add CSRF token utility and migrate first admin POST mutation path.
2. Convert one destructive GET workflow to POST-backed confirmation.
3. Add accessibility checks to smoke suite (axe on key pages).
4. Add route snapshot baselines for top public pages.
5. Replace first inline-handler-heavy template with external JS handlers.
6. Fix invalid markup in top 5 templates.
7. Begin HTML5 doctype migration in shared includes.
8. Introduce report-only CSP with telemetry.
9. Normalize shared admin feedback/alert components.
10. Add mobile-responsive rules for admin tables/forms.

