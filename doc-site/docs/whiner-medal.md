# Whiner and anti medals

## Default state

The **“Whiner”** anti medal and related **anti** medals are **shipped with their PHP definitions commented out** (“removed by request” in the source). The **word list** for the whiner query still exists in a helper, but the anti-medal entry points and front-page consolidation block are not active in a stock tree.

## Where to edit whiner *words* (if you enable the feature)

- File: [`src/include/functions_parser-medals.php`](https://github.com/alorbach/ultrastats/blob/main/src/include/functions_parser-medals.php)
- Function: `ReturnWhinerQuery()` (around the comment *Helper function which returns whiner words as a list for a query!*), which builds a `LIKE` list from a PHP array. Edit the array to add or remove substrings; keep site policy and local law in mind.

## Re enabling anti medals (advanced)

1. In **`functions_parser-medals.php`**, locate the block marked `/*  *** ANTI MEDAL CODE REMOVED BY REQUEST ***` and **uncomment** the anti medal definitions and related calculation code as far as you intend to use (e.g. `medal_anti_whiner` and the anti medal calc section—there are two large commented regions in the file; match opening/closing `/*` and `*/` carefully).
2. In [`src/index.php`](https://github.com/alorbach/ultrastats/blob/main/src/index.php) (not `scr/index.php`— that was a wiki typo), find the second block with the same marker and **uncomment** the anti medal SQL / `$content['medals_anti']` handling.
3. In the **Admin → Medal** options, enable the anti medals you use.

**Warning:** old anti medal code is legacy; test on a **copy** of the database. Some language may be offensive; adjust lists and options for your community.
