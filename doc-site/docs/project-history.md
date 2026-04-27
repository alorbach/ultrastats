# Project history

## Origins (2000s)

UltraStats grew out of the **Call of Duty** dedicated-server scene. Development traces back to the **mid-2000s** (copyright notices in the source list **2006–2008**). The version history in [src/doc/en/changelog.md](https://github.com/alorbach/ultrastats/blob/main/src/doc/en/changelog.md) for the *third* major line, UltraStats 0.3.x, starts with **v0.3.2 in September 2008**, adding **CoD: World at War** support, admin tools, themes, and GPLv3 packaging.

The last **upstream “classic”** release in that era was **0.3.13 (beta), 2008-11-30**—new icons, SQL workarounds, chat search, and database upgrade **v7**, among other fixes. **ultrastats.org** and **wiki.ultrastats.org** were the public home, downloads, and tutorials for thousands of clans and LAN hosts.

## Dormant years

After the late-2000s activity, there was a **long gap without official tagged releases** in the public record: the [changelog (Markdown)](https://github.com/alorbach/ultrastats/blob/main/src/doc/en/changelog.md) next documents **0.3.14** in **2026**—a **modernization pass**, not a small patch. In between, the **original project site and wiki went offline**; forking and mirrors kept the code and memories alive, but there was no maintained “one place” for help or binaries.

## Revival (from 2026)

**Andre Lorbach** (original author) brought the tree back to **current PHP and MySQL** (e.g. **mysqli**, PHP 8–friendly behavior, `utf8mb4`, security hardening, Docker for local work, CI releases). A lot of that work was done with the help of **AI-assisted coding**—interactive refactors, reviews, and documentation so changes stay consistent across a **large, legacy PHP** codebase.

The goal is practical: keep UltraStats **usable and honest** for the **small “old school” community** that still runs CoD1/UO/2/4/WaW (or similar) servers and wants **stats that match the era** without maintaining a from-scratch stack.

- **This handbook** on [GitHub Pages](https://alorbach.github.io/ultrastats/) replaces the old site as the **documentation front door** (see also the [main repository](https://github.com/alorbach/ultrastats)).
- **Releases and issues** live on **GitHub**; support is **issues and community effort**, not a commercial helpdesk.
- The [historical site snapshots](historical-reference.md) page only preserves **read-only** Wayback links for nostalgia and comparison—not as a live support channel.

If you are still hosting a **gamelog** and a **MySQL** box in 2026, you are exactly who this maintenance is for. Welcome back.
