# Whiner and anti medals

## Current behavior (stock source)

**Anti medals** (No.1 target, teamkiller, suicide, nade magnet, whiner, etc.) are **defined and calculated** in [`src/include/functions_parser-medals.php`](https://github.com/alorbach/ultrastats/blob/main/src/include/functions_parser-medals.php) when each `medal_anti_*` option is enabled in **Admin → General Options** (medal list). Run a **medal calculation** (or full parse) so `stats_consolidated` is updated.

On the **main page**, the Anti Medals block is shown when:

- **Show Medals on Mainpage** is on, and  
- **Show Anti Medals block on main page** is on (separate checkbox under Web options), and  
- at least one anti medal row exists for the current filter.

**Pro** and **Custom** blocks follow **Show Medals** only; the new checkbox only toggles the **Anti** block.

## Editing whiner *words*

- File: [`src/include/functions_parser-medals.php`](https://github.com/alorbach/ultrastats/blob/main/src/include/functions_parser-medals.php)  
- Function: `ReturnWhinerQuery()` — builds a `LIKE` list from a PHP array. Edit the array to add or remove substrings; keep site policy and local law in mind.

**Warning:** the default word list is legacy; some entries may be offensive. Adjust for your community.
