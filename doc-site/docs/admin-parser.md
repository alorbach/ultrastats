# Admin, parser, and live log (SSE)

## Running the parser

- From the **Server admin** area, use the **Run parser** (or equivalent) action for a server. The parser reads the gamelog path configured for that server and updates the database.
- Very large logs may hit **PHP time limits** on the web host. The [`src/contrib/`](https://github.com/alorbach/ultrastats/tree/main/src/contrib) folder contains helper scripts; you can also run the parser in a way that matches your host’s batch/CLI setup (see [install.md](install.md)).

## Server-Sent Events (SSE) live log

The admin **parser** UI can use a long-lived **`text/event-stream`** connection to append log lines without constant iframe reloads. Implementation: [`src/admin/parser-sse.php`](https://github.com/alorbach/ultrastats/blob/main/src/admin/parser-sse.php) and the template [`src/templates/admin/parser.html`](https://github.com/alorbach/ultrastats/blob/main/src/templates/admin/parser.html) (`EventSource` in the browser). Shared logic lives alongside [`parser-core.php`](https://github.com/alorbach/ultrastats/blob/main/src/admin/parser-core.php) / `parser-core-operations.php`.

## Reverse proxies

If you run behind **nginx** or **Apache** with buffering or compression, the SSE stream can stall or buffer until the end of the request. The application sets **`X-Accel-Buffering: no`** for nginx-style proxies; you should still **disable response buffering** on that location (e.g. nginx: `proxy_buffering off;` and/or pass through `X-Accel-Buffering: no`).

## Cancel

A cancel flow exists ([`parser-cancel.php`](https://github.com/alorbach/ultrastats/blob/main/src/admin/parser-cancel.php)) with a temp flag; the parser stops cooperatively when possible.

## Operations that are still “full page”

Some steps (e.g. FTP password prompts, certain confirmations) are still designed around the **classic** parser request flow. If the embedded stream is not usable, use the classic parser view or the CLI as appropriate.

## More context

- [AGENTS.md — Embedded parser (SSE)](https://github.com/alorbach/ultrastats/blob/main/AGENTS.md#embedded-parser-sse)
