# Summarize and squashed commit messages

Guidance for humans and for coding assistants (e.g. GitHub Copilot, OpenAI Codex) when the user asks for **SUMMARIZE**, a **detailed squashed commit message**, **PR or issue text**, or **handoff** after a change set.

**Index:** [`.agent` README →](../README.md)

## When to apply

- The user requests a paste-ready **squashed commit message** or **summary** for a batch of work.
- Preparing a **pull request** or **issue** description from recent edits.

## Gather ground truth (run first)

From the **repository root** of this clone:

**PowerShell (Windows):**

```powershell
Set-Location <path-to-repo-root>
git status -sb
git diff --stat
```

**POSIX shell (Linux, macOS, Git Bash):**

```sh
cd <path-to-repo-root>
git status -sb
git diff --stat
```

Optional wider scope (staged + unstaged vs last commit):

```sh
git diff --stat HEAD
```

Optional recent context:

```sh
git log --oneline -5
```

Separate **intentional** tracked source changes from **untracked** local or generated files; mention untracked noise only if it affects the handoff.

## Squashed commit message format

Paste as a **single** commit (subject + body):

```text
<imperative subject, ~50–72 characters>

<body: one to three short paragraphs grouped by outcome, not by file.>

<optional: validation that was run, e.g. PHP lint, Docker smoke test, or "Not run.">
```

**Conventions**

- **Imperative mood:** *Add*, *Fix*, *Update*, *Refactor*, *Document* — not *Added* / *Fixing*.
- The first line is the **title**; keep it one line.
- Group by **behavior and intent** (e.g. docs, security, database), not a raw file list.
- List **validation** only if it was actually run or appears in CI output.

## Optional: PR or issue (chat-ready)

```text
Summary:
- …
- …

Validation:
- …

Notes:
- …
```

## UltraStats-specific

- If documentation changed, reference [README.md](../../README.md), [AGENTS.md](../../AGENTS.md), [SECURITY.md](../../SECURITY.md), and other files under `docs/` as appropriate.
- For PHP/database work, call out **mysqli** and helpers in `src/include/functions_db.php` when relevant.
- Do not claim **browser UI** testing unless it was done; local Docker is typically `http://localhost:8091/` (see [AGENTS.md](../../AGENTS.md)).

## Do not

- Invent file lists or diffs from memory; use `git diff` / `git status`.
- Bundle unrelated refactors into the same summary.
