# UltraStats handbook

**UltraStats** is a **PHP** application that reads **Call of Duty** dedicated server log files, stores results in **MySQL**, and serves statistics and an **admin** area (parser, servers, users, database upgrades).

- **Source code & issues:** [github.com/alorbach/ultrastats](https://github.com/alorbach/ultrastats)
- **Releases (tarball + notes):** [GitHub Releases](https://github.com/alorbach/ultrastats/releases)
- **Current operator docs** in the repo: [README](https://github.com/alorbach/ultrastats/blob/main/README.md), [AGENTS.md](https://github.com/alorbach/ultrastats/blob/main/AGENTS.md), [SECURITY.md](https://github.com/alorbach/ultrastats/blob/main/SECURITY.md)
- **This site (public handbook):** [https://alorbach.github.io/ultrastats/](https://alorbach.github.io/ultrastats/)

## In this site

| Topic | Page |
|--------|------|
| Timeline, dormancy, 2020s revival | [Project history](project-history.md) |
| First install & gamelog / parser flow | [Install & first run](install.md) |
| Already installed? new version? | [Upgrading](upgrading.md) |
| Local Docker | [Docker](docker.md) |
| Parser, SSE, cancel | [Admin & parser](admin-parser.md) |
| Logos, menu, theme UI | [Theme & navigation](customization.md) |
| Whiner / anti medals | [Whiner & anti medals](whiner-medal.md) |
| Release history | [Changelog](changelog.md) |
| Old ultrastats.org & wiki (archived screenshots only) | [Historical site snapshots](historical-reference.md) |

**Supported games (original scope):** Call of Duty, United Offensive, CoD 2, CoD 4: Modern Warfare, CoD: World at War.

**Requirements (current baseline):** PHP **7.4+** with `mysqli`, MySQL **5.7+** / **8+** or MariaDB **10+**, and a web server (or the PHP dev server; see [Docker](docker.md)).
