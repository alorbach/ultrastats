# `.agent` skills (UltraStats)

Plain Markdown playbooks for **humans, GitHub Copilot, OpenAI Codex, and other assistants** — not tied to a single editor. They live in **[`.agent/skills/`](skills/)** at the repository root.

**Authoritative** project context remains **[AGENTS.md](../AGENTS.md)**; these files are **short, focused** workflows. Point your client’s “project instructions” or “skills” path at this folder, at [`skills/summarize-handoff.md`](skills/summarize-handoff.md), or at [AGENTS.md](../AGENTS.md).

| Skill | File |
|--------|------|
| SUMMARIZE / squashed commit / PR handoff | [skills/summarize-handoff.md](skills/summarize-handoff.md) |
| Release git tag (`v*` → GitHub Release) | [skills/release-tag.md](skills/release-tag.md) |
| Local Docker, port, gamelogs | [skills/local-development.md](skills/local-development.md) |
| Secrets, admin, SQL hygiene | [skills/security-hygiene.md](skills/security-hygiene.md) |
| Where code lives (short map) | [skills/repository-map.md](skills/repository-map.md) |

## Tool hints

- **GitHub Copilot:** [.github/copilot-instructions.md](../.github/copilot-instructions.md) points at [AGENTS.md](../AGENTS.md) and the summarize skill.
- Configure other products to load **this directory**, **`skills/*.md`**, or [AGENTS.md](../AGENTS.md) as your product allows.
