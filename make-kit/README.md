# Figma Make kit assets for @semio/ui

`@semio/ui` is published to **public npm** and used directly as a Figma Make kit — the package is the single
source of truth. This folder holds the two things the kit needs beyond the normal build: a CSS precompile entry
and the Make guidelines. No separate "make build" — the normal `npm run build` now emits everything.

## What makes the package Make-ready (already wired into package.json)

- **Precompiled CSS**: `build` runs `build:css`, which compiles `make.css` → `dist/semio-ui.css`, a complete
  static stylesheet (Tailwind scans the component source via `make.css`'s `@source`). Exported as
  `@semio/ui/styles.css`. Make imports this once; without it components render unstyled.
- **React 19 peers**: the preview must support React 19.
- **`@semio/data` and `@semio/utils` as real dependencies** (published publicly): Make installs them from npm — no bundling.

## Publish (public npm)

1. Check that the `@semio/data` and `@semio/utils` versions `@semio/ui` declares are on npm (they are
   dependencies). Both release from their own repositories, `semio-ai/semio-data` and
   `semio-ai/semio-utils`.
2. From the UI package root, run:
   ```bash
   npm run build
   npm publish --access public
   ```
   The build emits `dist/semio-ui.css`. In Studio, use
   `npx turbo run build --filter=@semio/ui` from Studio's root to build workspace
   dependencies and reuse cached outputs before publishing from the UI package root.

## Use it in Figma Make

1. New Make file → Settings → **Create a kit** → **Assemble your kit**.
2. Add the public npm package **`@semio/ui`** by name (public packages need no registry config).
3. Open the kit's `guidelines/` folder and paste in `guidelines/Guidelines.md` + `guidelines/components.md`
   from here. Confirm the line `import "@semio/ui/styles.css"` survives.
4. Test: prompt Make to build a screen and confirm it imports from `@semio/ui` and renders styled.

## Files

- `make.css` — Tailwind entry that precompiles the complete stylesheet (`@import "../public/styles.css"` +
  `@source "../src/**/*.{ts,tsx}"`). Input to `build:css`.
- `guidelines/` — the Make guidelines that keep Make using real Semio components.
