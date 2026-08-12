# @semio/ui

## 0.2.1

### Patch Changes

- f0a936f: A windowed `ListGrid`/`TreeGrid` no longer drops keystrokes while it scrolls to the cursor, and no longer reclaims focus from wherever the user has gone.

  Moving the keyboard cursor slides the window to follow it, which unmounts the row the user is standing on — and removing the focused element drops focus to `document.body`, where the list is not listening. Every keystroke arriving before focus was restored was delivered to the body and silently discarded. Typing a type-ahead query is the case that shows it: each character moves the cursor further than the list has scrolled, so `r7000` lost its last character and left the cursor at row 700.

  Focus is now restored during the layout phase, so a removal and the refocus answering it happen in one commit with no chance for the event loop to interleave. That alone is not enough — when the cursor moves faster than the list can scroll, the row focus is owed to is not the row that commit is mounting — so when the owed row is absent the list's own container takes focus until it arrives, and keys that land there are answered against the cursor's row. `TreeNavRoot`'s element is now programmatically focusable (`tabIndex={-1}`) for that purpose; it is still never a tab stop, which remains a row's job.

  Two ways focus could be taken from somewhere it belonged are fixed with it. Focus is only reclaimed when it was _lost_ — the body ended up with it because the element holding it was removed — rather than whenever it is merely outside the list, which had a list reclaiming focus from a dialog it had just opened as its own data changed underneath it. And focus owed to a row that has not mounted yet is cancelled when the keyboard leaves the list, so a row mounting long afterwards no longer pulls the user back out of whatever they moved on to.

## 0.2.0

### Minor Changes

- a21ad69: Optional row windowing for `ListGrid` and `TreeGrid`, so a listing of thousands of rows renders only the rows near the viewport.

  Opt in with `virtualized` plus a `scrollRef` pointing at the element that scrolls; `ScrollArea` now exposes its Radix viewport through a `viewportRef` prop for exactly this. Selection, range selection, type-ahead and Home/End continue to span the whole data set rather than the visible slice, and rows report `aria-setsize`/`aria-posinset` from the data so assistive technology is not told the window's size. The underlying `useRowWindow` hook is exported for consumers composing the row primitives directly instead of using the two composed grids.

  A windowed list also keeps a measured floor per content-sized column, because an `auto` track is only as wide as the cells the browser can see: without it, columns visibly resized as rows scrolled past. Columns still size to their content and still respond to the container's width — they grow into place rather than snapping back. `ListColumn` gains `width` and `minWidth` for callers who want a track pinned outright.

  `TreeGrid` and `TreeRow` also gain `size`, the row-height scale `ListGrid` already had. It was fixed at `h-9` before, which is now the `Md` default and still the density everything else is spaced to — so existing trees are unchanged. The heights themselves moved to a shared `row-metrics` module (exported), because a windowed list derives its first-paint estimate from the same table and the two must not drift: a tree and a listing at the same size are the same height, and a test asserts it at every size. Rows remain a single line at every size — the box changes, not how much content fits.

  Both grids and `TableList` now document that they render every row unless windowed, and `docs/windowed-lists.md` is a guide to assembling one correctly — the scroll-container wiring (including the `ScrollArea` case), what stays whole-dataset, the column-width behaviour, and the à-la-carte route with `useRowWindow`. Its code samples are compile-checked. The tree primitives' README is updated too: its à-la-carte example did not compile against the adapter's new required props.

  A windowed list disables scroll anchoring over its rows. The browser holds visible content still when something above it changes size, and in a windowed list the thing above is a spacer whose height changes by design every time the window moves — so it "corrects" an offset that was already right and the list walks away from where the user left it.

  A windowed list also keeps watching its row height rather than measuring it once. A row can mount before its styles do — a stylesheet injected asynchronously, a route-level CSS chunk, a late web font — and a one-shot measurement then locks in the height of an unstyled row: a list of 36px rows windowed itself at 18, so a scroll to row 500 arrived at row 1000. Changes below a pixel are still ignored, so variation between individual rows cannot feed the geometry back from the scroll position.

  Fixes `ScrollArea` re-handing out its viewport ref on every render. It merged the ref with `mergeRefs` called in the render body, which returns a new callback each time, and React detaches a ref whose identity changed before attaching the new one — so a consumer holding `viewportRef` saw `.current` blink to `null` on every unrelated re-render. Pass a stable ref (a `useRef` object or a `useCallback`) for it to stay stable.

  **Breaking: `react` and `react-dom` peer ranges narrow to `^19.0.0`.** The manifest allowed `^18.2.0`, but several components — `MenuButton`, `Combobox`, `Autocomplete`, `FloatingArrow`, and now `ListRow`/`TreeRow` — take `ref` as an ordinary prop, which only works from React 19. On React 18 such a `ref` is silently dropped, so the old range advertised support that did not exist; for a windowed list it would mean the row-height measurement never running. Each of those props now says so in its own documentation.

  **Breaking, for direct users of the low-level roving-focus adapter only:** `TreeNavRoot` requires `total` (the row count) and `TreeNavItem` requires `index` (its position in the data). The adapter no longer discovers items from the DOM, because that made every index calculation — Home/End, bounds, loop — mean "among the rendered rows". `ListGrid`/`TreeGrid` users are unaffected.

## 0.1.4

### Patch Changes

- 2430aa0: `ToggleGroup`'s selected label is legible in light mode, and a new `--on-accent-color` derives any on-accent foreground from the fill.

  The active item's label was hardcoded to `text-white dark:text-black`, the inverse of the theme, while the pill behind it is filled with `--accent-color`. That pairing only works if the accent is the darker of the two in light mode — and it is not, for the warmer brand hues. Measured against the app palette in light mode, white on the pill gives 2.5:1 on `Variant.Secondary` and 3.1:1 on `Variant.Tertiary`; a yellow `option.color` gives 2.3:1.

  `.responsive` now exposes `--on-accent-color`, derived from `--accent-color` itself with a lightness threshold, so the foreground follows whatever the fill actually is:
  - light mode goes from 2.5:1 to 8.4:1 on secondary, 3.1:1 to 6.9:1 on tertiary, 3.7:1 to 5.6:1 on primary;
  - pairings that already read well are unchanged, including every dark-mode variant and the neutral default;
  - arbitrary `option.color` values are handled on the same footing as the named variants, rather than only working when they happen to resolve dark.

  `Select`'s trigger swatch (`variant-mock-inner-item`) carried the same hardcoded pair over the same solid accent fill, and now uses the derived foreground too.

  The token is available to any component drawing content on an accent fill. It is computed entirely in CSS — no JavaScript is involved in resolving it — and was verified to produce identical results in Chromium, Firefox and WebKit. Browsers without relative color syntax (below Safari 16.4, Chrome 119, Firefox 128) fall back to the previous theme-flipped pair, so they see no change rather than a regression.

- 3df8f0f: `ToggleGroup`'s selected-item pill measures reliably instead of clipping its label.

  The pill was sized from a per-item React ref and positioned by an animated `motion.div`. Three things compounded to make it settle at the wrong width — most visibly cutting a label mid-word ("Pu|blished"):
  - the ref was attached to a trigger that could be wrapped by a `Tooltip` using `asChild`, so it did not always resolve to the rendered element;
  - the measurement ran once on mount, before the webfont had swapped, so it recorded metrics for the fallback face;
  - an interrupted enter animation could leave the element mid-flight, and the pill inherited that transient geometry.

  It now resolves items by querying `[data-toggle-item]` from a stable root ref, re-measures on a `ResizeObserver` and after `document.fonts.ready`, and renders as a plain element positioned with a CSS `transform` — a CSS transition rather than a JS animation, so there is no in-flight state to sample. Width is applied rather than animated, and the transition only engages once a real width is known, so the pill does not visibly grow from zero on first paint.

  `motion` is no longer imported by this component.

  The pill is also positioned from a layout effect rather than after paint, so it no longer shows one frame at the left edge when the initial value is not the first option, and it hides itself when no option matches `value` instead of staying parked behind the last match.

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
