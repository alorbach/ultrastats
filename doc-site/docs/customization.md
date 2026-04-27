# Theme, header, and navigation

The old [wiki](historical-reference.md) described `.htm` templates; this tree uses **`.html`** in [`src/templates/`](https://github.com/alorbach/ultrastats/tree/main/src/templates).

## Header image (logo)

- **Default location:** `images/main/Header-Logo.png` (served from the app web root, i.e. under `src/images/main/` in the source tree). Older docs mentioned **297×100** (simple replace) and **400×100** in a per-theme `img` folder if you point the template at `{BASEPATH}themes/{user_theme}/img/`.
- **Template:** [`include_header.html`](https://github.com/alorbach/ultrastats/blob/main/src/templates/include_header.html) — look for the `Header-Logo` / header image `img` tag and adjust the path to match your layout.

## Content area image

- **Default file name:** `ultrastatslogo.png` (e.g. under `images/main/`), with typical dimensions **300×200** in historical docs.
- **Template:** [`index.html`](https://github.com/alorbach/ultrastats/blob/main/src/templates/index.html) in the same folder (not `index.htm`).

## Menu / “home” link

- **File:** [`include_menu.html`](https://github.com/alorbach/ultrastats/blob/main/src/templates/include_menu.html).
- To add a custom link to an external “clan home” page, you can duplicate the first menu cell pattern and set `href` to your site; the label may use a language key such as `{LN_MENU_HOME}`. Optional **16×16** PNG icons can live under `images/icons/`.

## Disable the in-app theme / “skin” selector

- Historical instructions remove the block guarded by `<!-- IF theme_madebyenable="true" -->` in **`include_header.html`**. The wiki used to call this “deactivate theme changer” (do not confuse with a filename typo `include.htm` in some old copies).

## Security and upgrades

- Template edits are **overwritten** when you replace `src/` on upgrade unless you re-apply them from backup or a private fork. Track your changes.
