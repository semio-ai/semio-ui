# @semio/ui

## 0.1.3

### Patch Changes

- 4aef9ab: `ListRow` and `TreeRow` declare their own foreground colour, so a row stays readable without a themed ancestor.

  Neither component set a text colour, so a row inherited whatever its host page supplied — and a host that supplied none fell through to the user-agent default black: legible on a light surface, unreadable on a dark one. `ListGrid`'s column header cells already declared `text-neutral-500 dark:text-neutral-400`, so a listing rendered outside a themed panel showed legible headers above illegible rows.

  Both row components now set `text-neutral-900 dark:text-neutral-100`.

  Consumers that already wrap these in a themed container are unaffected: `GridPanel`, for instance, supplies exactly that pair, so the value rows were inheriting is the one now declared. Consumers that deliberately recolour rows are also unaffected — a `className` on the row still wins over the default.

  Patch rather than minor: no API surface changes, and selection continues to be expressed through `RowVisual.bar` / `RowVisual.background` rather than through text colour, so no consumer styling contract moves.

- a708b61: `ListGrid` and `TreeGrid` draw the keyboard focus indicator in the row's own accent colour, inset.

  Both hardcoded `focus-visible:ring-2 focus-visible:ring-blue-500/70` on the focusable row wrapper — a raw Tailwind hue rather than a token, and the one element that ignored the row's colour while the selection bar and background already derived from `var(--accent-color)`. The indicator now lives on the row itself and resolves that variable, so it matches the row's variant or custom colour.

  It is also an inset `outline` rather than a `ring`, so it paints above the row's absolute background overlay instead of behind it.

  Released here rather than in its own version: this shipped to `main` in #271 (STUDIO-99) without a changeset, so it was never published and is riding along with this release. Recording it so the changelog reflects what `0.1.3` actually contains.

## 0.1.2

### Patch Changes

- e15f29f: Add third-party icon attribution. Both packages now ship a `NOTICE` file crediting Tabler Icons (MIT) and Solar Icons by 480 Design (CC BY 4.0), satisfying the CC BY 4.0 attribution requirement for the bundled Solar icon designs. See `THIRD-PARTY-NOTICES.md` at the repo root.

## 0.1.1

### Patch Changes

- 067a56b: Make `size`/`variant` typing consistent across the component library.
  - `Breadcrumbs` and `ImageInput` now type `size` as the `Size` enum instead of a loose `string`, matching every
    other component that takes `size`/`variant`.
  - The `Variant`, `Size`, and `Theme` enums now document that a member must be referenced (e.g. `Size.Md`) —
    string literals are not assignable to props typed with these nominal enums. This guidance ships in the
    generated `.d.ts`. Also corrected the `Size` doc to include `Xl`.

  Type-only change; no runtime behavior is affected.

- e5f82d6: Unify the animation timeline viewport and split it into three independent canvases (SEM-114).
  - **@semio/utils** (breaking): removed `Player.viewport` and the per-tick viewport rewrite; `seek()` is now a pure stamp-set and the `updatePlayerViewportCenter` action is gone. Consumers that read `Player.viewport` must move to `@semio/animation`'s `viewportMotion`.
  - **@semio/animation**: viewport state now lives in a module-level `viewportMotion` (`viewport-state.ts`) with a swappable follow-policy subscription; one rendering invariant (fixed scene, moving camera); the HUD portal is replaced by three independent canvases (timeline / tracks / minimap); playhead cart redesigned. `scrollOffset`/`verticalFitCounter` removed from the animation store; `useOrthoCameraSetup` and `hud-section` removed.
  - **@semio/ui**: `menuStateAtom` now defaults to expanded (`true`).

  Bumped `minor` rather than `major` because these packages are pre-1.0 (0.x), where breaking changes ship as a minor per semver convention.

- Updated dependencies [e5f82d6]
  - @semio/utils@0.2.0

## 0.1.0

### Minor Changes

- Migrate to React 19 with compiler enabled. Upgrade React Three Fiber to v9, drei to v10, and enable babel-plugin-react-compiler. Fix all TypeScript compatibility issues and add Canvas fade-in for R3F v9 async initialization.

### Patch Changes

- Updated dependencies
  - @semio/utils@0.1.0
