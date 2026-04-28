# Release git tag (UltraStats)

Guidance for assistants when the user asks to **create/push a release tag**, **tag the current version**, **`$release`**, or **publish** a GitHub Release from this repository.

**Index:** [`.agent` README →](../README.md)

## When to apply

- User wants a **`v*`** tag created and pushed to **`origin`** to trigger [.github/workflows/release-on-tag.yml](../../.github/workflows/release-on-tag.yml) (tarball + release notes from **ChangeLog**).

## Source of truth for the version string

1. **`src/include/functions_common.php`** — `$content['BUILDNUMBER']` (e.g. `0.3.20`).
2. Tag form: **`v` + BUILDNUMBER** → e.g. `v0.3.20` (workflow matches `v*` only).
3. **Align before tagging** (operator expectation per [AGENTS.md](../../AGENTS.md)):
   - Root [ChangeLog](../../ChangeLog) has a **`Version X.Y.Z, …`** block for that release.
   - [doc-site/docs/version.txt](../../doc-site/docs/version.txt) **first line** equals BUILDNUMBER so admin “new version” check stays coherent after deploy.

Do **not** invent a tag version from git history alone if it disagrees with `BUILDNUMBER` without calling that out.

## Workflow (agent)

1. Read `BUILDNUMBER` from `functions_common.php` (and optionally confirm `version.txt` / ChangeLog head).
2. Compute tag: `v{BUILDNUMBER}` (e.g. `v0.3.20`).
3. From repo root, gather ground truth:
   - `git status -sb` — worktree should be clean **or** user explicitly accepts tagging with known uncommitted work (otherwise stop and list blockers).
   - `git tag -l "v*"` — ensure the new tag does **not** already exist locally.
   - `git ls-remote --tags origin "v{BUILDNUMBER}"` (or similar) — ensure tag not already on **origin**.
4. Create and push (non-interactive):
   - `git tag vX.Y.Z`
   - `git push origin vX.Y.Z`
5. Report success with tag name and that CI will build the release artifact.

## Blockers (stop and explain)

- Not a git repository or no **`origin`** remote.
- Tag **`v{BUILDNUMBER}`** already exists locally or on **origin**.
- **`BUILDNUMBER`**, **ChangeLog** head, or **version.txt** are inconsistent and user did not ask to fix them first.
- Uncommitted/unpushed release commits: default is to **not** tag until `main` (or chosen branch) contains the intended release state.

## Notes

- **Semantic “next patch” bump** is a separate step: change `BUILDNUMBER`, dual-format changelog, `version.txt`, then commit; **then** run this tag workflow. For auto-bump-from-tags logic, a separate automation or external skill may apply; this playbook is **tag = current BUILDNUMBER**.
- Do not add **wiki.ultrastats.org** links; handbook is GitHub Pages (see AGENTS.md).

## Validation

- Agent did **not** claim a successful push without running `git push`.
- Prefer confirming Shell exit success for `tag` / `push` commands.
