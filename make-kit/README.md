# Figma Make kit assets for @semio/ui

`@semio/ui` is published to **public npm** and used directly as a Figma Make kit — the package is the single
source of truth. This folder holds the two things the kit needs beyond the normal build: a CSS precompile entry
and the Make guidelines. No separate "make build" — the normal `npm run build` now emits everything.

## What makes the package Make-ready (already wired into package.json)
- **Precompiled CSS**: `build` runs `build:css`, which compiles `make.css` → `dist/semio-ui.css`, a complete
  static stylesheet (Tailwind scans the component source via `make.css`'s `@source`). Exported as
  `@semio/ui/styles.css`. Make imports this once; without it components render unstyled.
- **React 18 || 19 peers**: so the package runs in Make's React-18 preview iframe and in the React-19 apps.
- **`@semio/data` and `@semio/utils` as real dependencies** (published publicly): Make installs them from npm — no bundling.

## Publish (public npm)
1. Publish `@semio/data` and `@semio/utils` first (they are dependencies):
   ```bash
   cd packages/data && npm run build && npm publish --access public
   cd ../utils && npm run build && npm publish --access public
   ```
2. Publish `@semio/ui`:
   ```bash
   cd packages/ui && npm run build && npm publish --access public
   ```
   (`npm run build` now also emits `dist/semio-ui.css`.)

## Use it in Figma Make
1. New Make file → Settings → **Create a kit** → **Assemble your kit**.
2. Add the public npm package **`@semio/ui`** by name (public packages need no registry config).
3. Open the kit's `guidelines/` folder and paste in `guidelines/Guidelines.md` + `guidelines/components.md`
   from here. Confirm the line `import "@semio/ui/styles.css"` survives.
4. Test: prompt Make to build a screen and confirm it imports from `@semio/ui` and renders styled.

Full walkthrough: the project `RUNBOOK.md` (note: the registry/scope steps there are for the private route and
don't apply to this public path).

## Files
- `make.css` — Tailwind entry that precompiles the complete stylesheet (`@import "../public/styles.css"` +
  `@source "../src/**/*.{ts,tsx}"`). Input to `build:css`.
- `guidelines/` — the Make guidelines that keep Make using real Semio components.
