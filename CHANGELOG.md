# @semio/ui

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
