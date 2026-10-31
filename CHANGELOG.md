# @semio/ui

## 0.5.2

### Patch Changes

- c4e5ee3: The package is now licensed under Apache-2.0 and released from its own repository.

## 0.5.1

### Patch Changes

- Updated dependencies [87f9c41]
- Updated dependencies [87f9c41]
  - @semio/data@0.1.0
  - @semio/utils@0.6.0

## 0.5.0

### Minor Changes

- e3be707: `Dialog`, `ToastManager` and the controls `Checkbox`, `ToggleSquare`, `Switch`,
  `ToggleGroup`, `Progress`, `ImageInput`, `Accordion`, `Collapse` and `Separator` are
  built on Base UI instead of Radix. Menus (`Dropdown`, `ContextMenu`, the nested menu
  elements and the canvas menu), `Popover` and `Tooltip` are still built on Radix, so
  `radix-ui` remains a dependency. Props are unchanged; these behaviours change:
  - `Dialog` returns focus to the control that opened it when it closes, where before
    focus fell to the page.
  - Escape in a `Dialog` opened from a `Modal` closes only the `Dialog`; the `Modal`
    stays open.
  - A `Modal` opened from a `Dialog` takes focus, where before focus stayed on the
    `Dialog` behind it, and Escape closes only the `Modal`.
  - `CollapsibleRoot`, `CollapsibleTrigger`, and `CollapsibleContent` are not exported.
    Use `Collapse`, or import `Collapsible` from `radix-ui` directly to use its raw
    parts and `data-state` contract.

  ## Upgrading

  The `data-state` attributes and Radix panel size and toast swipe variables are
  kept for now and will be removed in a later minor release. Roles, state ARIA,
  orientation attributes, and native disabled buttons keep their public contracts.

  Toggle-group roving focus places `tabindex="0"` on the current focus target,
  starting with the selected item, and `tabindex="-1"` on the other items. The group
  container has no `tabindex`. Style selection with `aria-checked` or `data-state`,
  and focus with `:focus-visible`.

  Accordion triggers stop Arrow, Home and End keydowns from bubbling to ancestors
  and document listeners.

  Escape closes a toast only while focus is within the notifications viewport.
  Swipe dismissal uses a 40 px threshold.

  `Checkbox`, `ToggleSquare` and `Switch` always render a hidden `<input>` immediately
  after the control. The control is not `:last-child`, affecting parent `space-x-*`
  and `last:` utilities.

- 4bb39a2: Add versioned, transport-neutral diagnostic reports compatible with structured
  Result errors, JavaScript exceptions, and Rust error adapters. Reports preserve
  error kinds, codes, bounded causes and optional stacks/backtraces, allowlist UI
  context, and redact common credentials and URL queries.

  Add optional medium sizing and a custom footer to Dialog, with scrolling body
  content and fixed header/footer controls for long reports.

- 3db3ee1: On a desktop-width layout, a side pane is clipped to the height of its row and
  scrolls its own content, as it already was on a narrow layout. A left pane whose
  content is taller than the window no longer makes the page scroll, so the footer
  pane keeps the height its content declares, and a `ScrollArea` placed directly in a
  left pane scrolls. A pane whose content does not scroll itself is cut off at the
  bottom when the window is too short for it; wrap it in a `ScrollArea`.
- 4bb39a2: Add a domain-neutral ActionMenu and optional ToastData.actionMenu configuration.
  Callers provide labels, icons, and actions returning Result-based feedback. An
  explicit action menu replaces the clipboard shortcut. Toast dismissal pauses while
  menus are open or actions are pending, and feedback starts a fresh reading interval.
  Keep ordinary provider children outside the animated toast list so multiple
  children remain independent of notification exit animations.
  Studio supplies its own error-report copy and email-draft actions.
- 4bb39a2: Add optional `ToastData.clipboardContent` for copying caller-provided details with
  an outlined clipboard icon beside the close button. Copying preserves the toast,
  announces success, and shows a retryable inline message when clipboard access fails.
  Toasts with clipboard content default to ten seconds; a numeric `dismiss` overrides
  the duration, and toasts without clipboard content retain their four-second default.

  Keep toast widths within the viewport and invoke the callback supplied by a labeled
  `dismiss` action when that button is clicked.

- f2ebc2d: `Checkbox`, `Switch` and an icon-less `ToggleSquare` edge themselves in their
  variant's checked-fill colour (`--standard-color`) in every state, and a checked
  control's edge follows its fill on hover. The edge is no longer a neutral grey held
  to 3:1 against the layout surfaces; on a light surface the brightest variants' edges
  are faint.

  A `Switch` thumb is the variant colour when off, and when on it is the foreground for
  the checked fill (`--on-standard-color`, white or black, whichever contrasts with
  it). It keeps that colour while the switch is hovered, and its colour animates with
  its movement. A disabled thumb keeps the same colours at half strength.

### Patch Changes

- 1e272bf: A sticky `Accordion` header (`sticky`) paints above positioned content in its
  panels, so rows scroll beneath its blur instead of over it.
- c2738c1: A disabled menu entry with a reason now stays in the menu's keyboard order: a
  `NestedItem` with a `description`, or a `NestedRadio` or `NestedSelect` option with
  the new `disabledReason` field. An option's `description` keeps meaning what choosing
  it does, and never makes a disabled option reachable; neither does a group-level
  `disabled` without the option's own `disabledReason`.

  Arrow keys, typeahead and Home/End reach such an entry, and a menu opened from the
  keyboard focuses it when it comes first. It reports `aria-disabled`, with the reason
  as its accessible description and its tooltip. Enter, Space and a click do nothing,
  leave the menu open and leave the reason showing. Focused, it takes a lighter fill
  than an enabled row and keeps its disabled text, icon and indicator colours; under
  the pointer it shows the default cursor. A disabled option with a `disabledReason`
  shows it on hover.

  `Tooltip` stays open when its trigger is `aria-disabled` and is pressed, and when the
  pointer enters a `ScrollArea` around its trigger. Scrolling that area still closes it.

- 544a676: An action toast's button (`dismiss: { label, onClick }`) runs its `onClick` with the
  toast's data, then closes the toast. It closed the toast without running the action.
- f718bde: An expired toast asks the `ToastManager` to remove it once rather than on every animation frame of its exit, and `removeToast` leaves the toast list unchanged when the toast is already gone, so a leaving toast no longer re-renders every toast consumer. A toast added again under the same id while it is still leaving starts its interval over.
- Updated dependencies [a26939f]
- Updated dependencies [4bb39a2]
- Updated dependencies [f286b72]
- Updated dependencies [6e59734]
- Updated dependencies [0a439db]
- Updated dependencies [6371a2a]
- Updated dependencies [a764cdc]
  - @semio/utils@0.5.0

## 0.4.0

### Minor Changes

- 68f6c72: Add BreadcrumbTrail for flat navigation with separate ancestor links and sibling switchers, searchable choices, loading/error/empty states, registry icons, reserved label widths, and optional renaming through double-click, F2, or a menu action. Keep the existing tree-based Breadcrumbs API available.

  Add shared toolbar-segments styling for consistent control gaps and adjacent corners. Use Base UI for searchable breadcrumb pickers so typing retains focus while hovering choices. Picker actions hand off after closing before opening a dialog.

- fb2e03d: Add a readOnly mode to ChipInput that displays selected chips without editing controls or interaction styling.
- 1242fdc: Add closeOnCancelClick to Dialog for footer actions that change a step without closing. Add cancelDisabled, dismissDisabled and opt-in closeOnOverlayClick for async dialog flows. Give the header X a distinct Close label. NestedMenu accepts trailing content beside its disclosure icon.
- 58ee9aa: Allow layout footer actions to execute directly with onClick, including mobile
  menu rendering. Menu click handlers can return false to preserve the selected pane
  while a caller confirms navigation. MenuButton supports native disabled behavior.
- 5033a08: Add `ListGrid.emptyBody` so consumers can show a full-width empty-state row while keeping the column headers.

### Patch Changes

- 59c07f3: `Select`'s trigger is a keyboard-reachable button whose accessible name includes both its field label and selected value in text and icon-only layouts, `Autocomplete` takes an optional accessible label for its input, and `Snippet`'s copy control announces "Copy" and "Copied!".

  `Select` uses a native button for disabled semantics. Keyboard focus and hover show a wrapping explanatory tooltip. `Tooltip` content is hoverable, so moving the pointer onto the explanation keeps it visible; Escape dismisses it. Tooltip content is never interactive: use `Popover` for links or actions.

- 7eafe8d: Make current breadcrumbs without a sibling switcher keyboard-accessible for renaming, with a sized field and focus restoration. Keep editable split-switcher labels visible and preserve their reserved width during renaming.
- d25b073: Icon toggle buttons no longer carry the unchecked-control edge; it stays on checkboxes, switches, icon-less toggle squares and list indicators.
- 4fa327f: Keep dropdown, context, and interactive canvas menus modal so they remain usable
  inside dialogs and beside focus-managing lists. Run closing nested-item actions
  after the root menu's teardown and focus restoration, preventing overlapping
  menu/dialog background-hiding counters from leaving the application aria-hidden.
- 8101906: Keep checkbox, toggle square, and switch boundaries visible on every layout surface in both themes, including disabled controls and list indicators.
- Updated dependencies [718aa2c]
  - @semio/utils@0.4.0

## 0.3.0

### Minor Changes

- 97535c3: Add a reusable account-setup progress stepper and modal footer controls, and expose Firebase session verification and provider details for state-driven account onboarding.
- e0eaaaa: `Avatar` takes a `sizing` prop, so a container can size it instead of the `size` prop.

  `sizing="container"` omits Avatar's own `sized-height sized-width` and lets the caller's class decide the box.

  **It exists for the aspect-ratio case.** `size` emits an explicit `height`, and an explicit height beats an `aspect-ratio` outright — they are different declarations, so no cascade rule resolves it in the caller's favour. An avatar given `aspect-video w-full` renders 200×32 under `"size"` and 200×112.5 under `"container"`, which is why a card's media slot needs it.

  **It is not needed to beat a same-family width/height class**, and it would be easy to conclude otherwise. Tailwind compiles the size variants as `.sized-height:where(.size-md)`; `:where()` contributes no specificity, so both rules sit at `(0,1,0)` and `sized-row-media` — emitted later in the sheet — already wins. A row tile measures 28px under either setting. Reach for `"container"` when the caller states a ratio rather than a length.

  All three sizing sites are gated together — root, image and fallback. Gating only the root leaves the fallback at its intrinsic size inside a container-sized box, which overflows rather than fills.

  `size` is still meaningful under `sizing="container"`: it drives the fallback's type scale, so pass the size the initial should read at.

  Default is `sizing="size"`, so every existing `Avatar` is unchanged.

- f60ad86: New `Card` component — the structure of a content card, not just its surface.

  `.card` has always been a utility class supplying a background and a border, leaving every consumer to invent the layout on top of it. `Card` adds the shape those consumers kept rebuilding: an optional media slot with a corner overlay, a title row with a trailing slot, body content, and a footer pinned to the bottom. Slots are `ReactNode` props rather than compound children, matching `ListRow`/`TreeRow`.

  It declares its own foreground (`text-neutral-900 dark:text-neutral-100`). The `.card` class supplies no text colour, so a card built on the bare class inherits whatever its host provides — and a host that provides nothing falls through to the user-agent default black, which is unreadable on a dark surface. That is the same defect `ListRow` and `TreeRow` carried. Building on `Card` rather than the raw class avoids it.

  Also `h-full`, so a card fills its grid cell; with the footer's `mt-auto` that is what aligns footers across a row of cards with unequal body content.

  Minor rather than patch: new public export, purely additive. `.card` itself is unchanged, so existing consumers of the class are unaffected.

- b9fab3b: `CardGrid`: a `justify` prop, for grids whose tracks do not fill the row.

  Only meaningful with fixed-width tracks — `1fr` tracks absorb every spare pixel themselves, so there is no free space to justify and the prop does nothing. With fixed tracks there is almost always leftover width, and where it goes is a matter of taste rather than correctness: `start` keeps the first card aligned with whatever heading sits above the grid, `center` looks tidier in isolation but breaks that alignment, and `space-between` reads well at three or four columns and badly at two, where the cards fly to opposite edges.

  So it is a parameter rather than a decision baked into the component, and the answer can differ per surface. A caller passing `justifyContent` through `style` still wins.

  The new `FixedWidthTracks` story shows the three settings side by side under `repeat(auto-fill, minmax(min(280px, 100%), 280px))` — fixed cards, a column count that follows the container, and a single column that scales once there is no room for a whole card.

- f23dbe6: New `CardGrid` — selection and two-dimensional keyboard navigation for a grid of items.

  `CardGrid` is to a card layout what `ListGrid` is to a table: the same selection core (`useListState`), under a different navigation model. It exists as its own component because a grid is genuinely two-dimensional — Left/Right step one item, Up/Down step a whole row — and the shared hook, like `TreeNavRoot`, only knows linear next/previous. Before this, a card layout could only be selected by mouse.

  The row step is derived from the **measured** column count, read back from the resolved `grid-template-columns`. Consumers set columns with responsive classes (`sm:grid-cols-2 lg:grid-cols-4`), so the number in effect depends on the container's width at the moment a key is pressed; measuring keeps vertical navigation correct at every breakpoint with no `columns` prop that could silently disagree with the CSS.

  Also included: roving tabindex so Tab enters and leaves the grid rather than walking every card, `role="listbox"`/`option` once items are selectable (`grid`/`gridcell` otherwise, matching `ListGrid`), Home/End, Escape to clear, Cmd/Ctrl+Arrow to move focus without changing selection, Shift+Arrow range extension in `multiple` mode, type-ahead, click-away deselection, and the same interactive-element guard `ListGrid` uses so an embedded button or menu never changes the selection.

  Items are rendered by the consumer through a render prop receiving `{ selected, focused }`, so `CardGrid` owns behaviour and layout while the item's appearance stays the consumer's — it is not coupled to `Card`.

- f191a72: New `.card-overlay` surface class, and `.card` / `.card-transparent` lose their border.

  Surfaces now separate by elevation rather than by a drawn edge. `.card-overlay` is a deeper-inset sibling of `.card` — `layout-*-deep-inset` against `.card`'s `layout-*-inset` — and every popup surface takes it: `Dropdown`, `ContextMenu`, `Popover`, `Toast`, `Tooltip`, `TrackedTooltip`, `Tooltip3D`, the `Combobox`/`Autocomplete`/`Select` popup, the desktop `NestedMenu`, and `NestedCheckboxTree`'s submenu. Reach for it whenever a surface floats over the page; `.card` stays for content resting in it, and for `Modal`/`Dialog`, which paint their own `bg-black/40` scrim.

  **`.card` no longer paints a `border-2` in `--card-border-color`, and `.card-transparent` no longer paints the matching `outline-2`.** A consumer relying on that edge — a `.card` sitting directly on another `.card`, or on a panel close to it in lightness — will see the two merge. `.card-transparent` compensates in part by going from 80% to 90% opacity behind a `backdrop-blur-xl` rather than `-lg`.

  **The separation these classes now provide does not meet WCAG 1.4.11's 3:1 for a component boundary, and the border it replaced did not meet it either.** Measured on this palette: the background delta runs 1.01:1 to 1.42:1, the strongest pixel of `shadow-lg` adds at most 1.26:1, and that shadow is offset downward so a surface's top edge gets none of it. `--card-border-color` ran 1.61:1 to 2.34:1 on the same pairs — better, still short. The figures and their controls live in `floating/surface-separation.browser.tsx`. Closing the gap means widening the `layout-*` steps, which is a change to the whole ramp rather than to these classes.

  `--card-border-color` is unchanged and still resolves per variant, so a consumer drawing its own edge from the token keeps working. Nothing in the package paints it now: `.colored-carrot-stroke` is its only remaining reader and no component applies that class, so the class ships defined and unused.

  `Dropdown` still accepts a `color` and it still drives the popup's content, but it no longer reaches that dropdown's arrow — the arrow fills from `layout-*-deep-inset` to match the popup it hangs off, and a caller's colour would break that match. `Arrow`'s own `color` prop is unchanged and still applies on a filled arrow, which is what an inverted `Tooltip` renders.

  Minor rather than patch: `.card-overlay` is additive, but `.card` and `.card-transparent` change appearance for every existing consumer.

- e0b63c1: `Card` gains a full-width `primaryAction` slot, a `selected` state, and hover emphasis.

  `primaryAction` is distinct from `footer`, which takes arbitrary content: it encodes the contract that a card face carries exactly _one_ verb, rendered full-width across the bottom. Anything additional belongs where there is room and context — a preview pane, the item's own page, or an overflow menu — rather than competing for the face. Which verb is default may vary by surface, so the choice stays the consumer's; the singularity does not.

  `selected` and `interactive` draw the emphasis a selectable card needs, using the same intensities as `defaultResolveRowVisual` so a selected card matches a selected row: an 18% accent tint when selected, 8% on hover, plus an accent border.

  Two implementation notes that are easy to get wrong when extending this:
  - The tint is a separate absolutely-positioned layer, not a `bg-*` utility on the root. A background utility would _replace_ `.card`'s own surface, and since these tints mix toward `transparent` the card would turn see-through instead of tinting. `ListRow` solves it the same way, and the card's in-flow content is `relative` so it paints above the layer.
  - Hover emphasis is applied only when _not_ selected. Both states set `background-color`, and the `hover:` variant wins on source order — so applying both made a selected card lose its highlight for as long as the cursor rested on it.

- 1a485fe: `Card` gains a `subtitle` slot: a second identity line directly beneath the title, with no gap.

  The body is a `gap-2` stack, so a consumer putting an item's address or scope as the first body child got it 8px under the title — far enough that it read as the first line of the metadata rather than as part of the name. A list row shows those same two lines tight together, so one item described itself with two different shapes depending on the view. `subtitle` shares a wrapper with the title row, which puts the body's gap below the pair instead of inside the name.

  Placement only, no typography. Like `children`, the slot states no size and no colour, so a consumer whose rows and cards have to agree can pass one component to both — which is the point, since the divergence this fixes came from each view spelling the line itself. It follows the rule the component already documents for body content: state a muted colour outright rather than reaching for `opacity`, because opacity over an inherited black is still black.

  `min-w-0` on the new wrapper, or a truncating subtitle has nothing to resolve against.

  Minor rather than patch: new optional prop, purely additive. A `Card` that passes no `subtitle` renders identical markup.

- 19a8313: `Chip` takes `visuals`, and `StatusDot` is the mark alone.

  **Breaking: `StatusDot` no longer takes `label`.** A dot with a word beside it on a filled pill is what `Chip` already is, down to the leading slot — so a labelled form here was a second implementation of one layout. Compose them instead:

  ```tsx
  <Chip size={Size.Xs} visuals="subtle" icon={<StatusDot variant={Variant.Success} />}>
    Connected
  </Chip>
  ```

  The chip owns the ground, the rounding, the size scale and the label; the dot owns the state's colour. **The two stay independent by construction:** `variant-on-fill-slot` forces `color`, while the dot paints `background-color` from its own `--standard-color` — so a dot keeps its hue inside a chip whose ground is neutral. That is asserted in the on-fill contrast suite rather than left to hold by accident, across every variant in both themes.

  `visuals` matches the prop `Button` and `Avatar` already carry:
  - **`"default"`** — the variant's own fill. Unchanged, and still the default.
  - **`"subtle"`** — a neutral surface taking no variant colour, for a chip whose meaning is carried by what it holds. A solid variant fill there makes the container compete with its own mark, and at `Error` turns a routine state into something that reads as an alert.

  It is backed by a new `variant-subtle-bg` utility: the layout inset fill, theme-flipped, with its foreground declared alongside it so no caller can own half the pair. The treatment already existed twice without a name — as `variant-checkbox-bg`'s off state, and hand-rolled wherever a quiet chip was wanted. The foreground is `neutral-800`/`neutral-200`, deliberately not a mid grey: `neutral-500` on these grounds reads as disabled and does not clear 4.5:1.

  `@base-ui/react` subpaths are pinned in the package's vitest config. Discovered mid-run instead, a dep is optimized while the suite executes, and the optimized bundle and the source copy hold different React instances — every test in the affected files dies at once with "Invalid hook call … more than one copy of React". It only fires when a subpath is new, and a warm cache hides it, so it lands on whoever adds one and looks like their bug in components they never touched. **Add to that list when importing a subpath the package has not used before.**

- ca48232: `Dropzone` and `SelectList` render `ListGrid`, and `useListState` is no longer exported.

  `Dropzone` is a wrapper around a list, so its public API is now that list's: `data`,
  `getRowId`, `columns`, `resolveVisual`, `getSearchText`, `size` and `noHeader` mean
  here exactly what they mean on `ListGrid`. Leaving them shaped around the engine
  being retired would keep that engine's vocabulary in the package's public surface
  after the engine is gone.

  `SelectList`'s API is unchanged, and deliberately so: it takes `value`/`onChange`/
  `options`, which is a select model, and what it renders _as_ is a select. Only its
  internals moved.

  `useListState` stays in the package — `CardGrid` is built on it — but is no longer
  reachable from `@semio/ui`. Six names leave the public surface with it: `useListState`,
  `useTableListState`, `ListItem`, `TableListItem`, `UseListStateOptions` and `ListState`.
  `CardGridProps` still names `ListItem` in its constraint and still resolves, but a caller
  writing its own `<T extends ListItem>` helper can no longer name that constraint.

  `SelectionMode` keeps its public name, now exported from the `ListGrid` module.

  **Migration — `Dropzone`:**
  - Add `getRowId`. Rows no longer need a `key` field, so a `data` item that carried one
    purely to satisfy `ListItem` can drop it.
  - `columns` is `ListColumn<T>[]`: `header` is optional, and `render` takes
    `(item, { focused, selected })` rather than three positional arguments. A per-cell
    `className` now belongs on the column.
  - `rowClassName` and `headerClassName` are gone. Row appearance is `resolveVisual`,
    the same seam every row-shaped list uses; the shared default already supplies the
    hover tint most callers were spelling out by hand.
  - `T` is no longer constrained to `ListItem`.

  Two visible differences come with the engine, both intentional:
  - Rows are the shared rhythm — `Size.Md` is `h-9`, where the old engine's was `h-8`.
  - `SelectList` marks the chosen option with the shared left-edge bar and tint rather
    than a filled row with inverted text, so a selected option's label keeps its normal
    colour, and its fallback bullet is registry-sized rather than the raw tabler default.

- f2a1653: New `EmptyState` component — what a surface shows when it has nothing to show: a glyph, an optional heading, a sentence and an optional next step, centred.

  The glyph and the sentence are painted by the text roles rather than by hand. The sentence is `TextRole.Note`, and the glyph box carries the same role so the glyph's `currentColor` is the sentence's colour in both themes, including the variant-derived hue. A glyph dimmed with `opacity-*` beside a sentence set to one neutral rung reads acceptably in the theme it was tuned in and falls well below the surrounding text's contrast in the other; the role carries both halves of the light/dark pair.

  The glyph is sized through `.icon-standard` inside `.sized-icon` at `Size.Xl` — an explicit 28px step. A glyph passed as an element without `.icon-standard` (an `<Icon size="none">`) keeps its own size.

  `title` renders as `TextRole.Value`, semibold, as an `h2` unless `titleAs` names another level. `className` lands on the root, which has no padding or minimum height of its own.

  Minor rather than patch: new public export, purely additive.

- 7ce8ad5: `Header` no longer renders a trailing spacer of its own — a toolbar opts in with a `toolbar-spacer` item.

  The hardcoded `flex-1` sat between the toolbar items and the right-pane toggle, so **every** toolbar got one whether it wanted one or not. A toolbar whose own content should absorb the free width then had to out-grow it: the studio app's search card carried `grow-[9999]` purely to win that fight, and still surrendered the gap between them, leaving the card short of the header's right edge whenever a right pane was open.

  Two elements competing for the same space is not a layout. Making it opt-in moves "what takes the slack" to the surface, which is the only place it is known: a toolbar with a growing element needs no spacer, and one without adds `{ id, type: "toolbar-spacer" }` to push its trailing controls right.

  **Migration:** if your toolbar has no growing item and you relied on the trailing controls sitting at the right edge, append a `toolbar-spacer` item. If something in your toolbar already grows, you can drop any grow-factor hacks that existed to beat the old spacer.

  Two spacing fixes come with it, both of which the old spacer had been hiding:
  - The row now carries `desktop:pr-0`, matching its existing `desktop:pl-0`. The stray right padding left the trailing item 4px short of the header's edge, so a growing toolbar card no longer lined up with the content panel beneath it — invisible while a spacer occupied that space, obvious once the card grew into it.
  - The right-pane toggle gains `desktop:ml-1`, making 8px with the row's `gap-1` — the same separation the toolbar's own cards keep from one another. The row gap alone left it 4px from the preceding card, which reads as touching when both carry a border. It is a margin on the button rather than padding on the row, so it disappears with the button when a right pane is open instead of lingering as a phantom inset.

- bc2c951: A control's glyph is now an explicit step per `Size` — 12 / 16 / 20 / 24 / 28px
  for Xs / Sm / Md / Lg / Xl — instead of 3/5 of whatever box it sits in, and a
  `Button` and a field at the same `Size` resolve to the same step.

  Both slots took 3/5, of boxes that differ, so they disagreed at every size: a
  button beside a field sat two to three pixels proud, and pinning the button's
  glyph by hand was the only lever. 3/5 also lands on fractional pixels at most
  sizes — 16.8 at Sm, 19.2 at Md — so the standard size was a subpixel rendering
  box. A cross-tabulation of the icon-bearing `Button` call sites found that every
  hand-pinned glyph in the product was one of those fractions rounded to the
  nearest step, and that none of them disagreed about which step: Sm was always
  pinned to 16, Md always to 20. The scale below is those call sites' own answer,
  made the default.

  Applies to `Button`'s glyph box and to `.sized-inner-group-item`, which is the
  box behind field adornments, `Combobox`, `Chip`, `ChipInput`, `ToggleGroup`,
  `ToggleSquare` and `Tabs`. Sizing the class rather than the handful of call
  sites a reader happens to look at is deliberate — snapping only some of them is
  how two scales diverged in the first place.

  Sizes that move: `Button` Sm 16.8 → 16, Md 19.2 → 20 and Xl 28.8 → 28 — only Xs
  and Lg came out exact under 3/5, at 12 and 24; every field size, which was
  fractional throughout (14 → 16, 17 → 20, 22 → 24 at Sm/Md/Lg); `Chip` 14.4 → 16
  at Sm and 26.4 → 28 at Xl; `ChipInput` 21.6 → 24; `ToggleGroup` 16.8 → 20.

  A call site can still depart from the scale, and two deliberately do. The rule
  targets `.icon-standard` rather than `svg`, so an icon passed as
  `<Icon size="none" className="…" />` carries no `.icon-standard` and keeps
  exactly the size it asked for.

  Not changed, and not pending: `.icon-slot` — `Select`, `SelectTree` and the
  nested indicators — stays proportional. It fills a box the call site draws for
  indicator purposes, so its glyph is sized against that box rather than against a
  control's height; the two are different quantities, and a Select's glyph reading
  smaller than the field beside it is that distinction rather than drift.
  `.list-item-icon` is
  now spelled as an explicit 12px, which is what 3/5 of its fixed 20px box already
  produced. `visuals="list-item"` keeps its own indicator scale.

  Unchanged too: glyph colours still differ between button and field, which was
  always deliberate — a button's glyph is the control, a field's is an adornment
  beside the text.

- 47a771b: **Breaking: `IconKeyOutline` and `IconKeyOutlineDash` are no longer exported.** The
  keyframe glyph is one registry role now — `key` — whose outline and dashed forms are
  states of it rather than separate components.

  ```tsx
  // before
  <IconKeyOutline />
  <IconKeyOutlineDash />

  // after
  <KeyIcon fillOpacity={0} />
  <KeyIcon fillOpacity={0} dashed />
  ```

  `KeyIcon` is the typed wrapper over `<Icon name="key">`, so a consumer that has
  overridden the `key` role in its own registry gets its glyph here too — which is the
  reason the separate components could not stay: they rendered a fixed SVG that no
  registry override could reach, so a consumer theming its icons got the themed keyframe
  everywhere except these two call sites.

  `minor` rather than `major` per this package's pre-1.0 convention, where a breaking
  change ships as a minor.

- 06a1ef5: `ListColumn` takes a `className`, applied to that column's cell.

  For the cell box rather than its contents — padding and alignment overrides a `render` cannot reach, since a cell's own `px-2` sits outside whatever the renderer returns. A trailing actions column is the case that needs it: at the default padding a control there is twice as far from the column beside it as from the row's edge, so it reads as belonging to the edge of the surface rather than to the row.

  **It was already possible to pass and silently ignored.** `ListRowColumn` has carried `className` all along, but `ListGrid`'s column mapping overwrote it with the `hideBelow` class, and `ListColumn` never declared the field — so a caller passing one got no type error and no effect. The mapping now merges the two rather than choosing between them, since a column can legitimately both hide below a breakpoint and carry its own cell classes.

- 2c24c55: New `Markdown` component, for rendering user-authored prose.

  Adds `react-markdown` + `remark-gfm` as dependencies. The library choice is a security decision more than a formatting one: this renders content written by one user and shown to others, and `react-markdown` builds a React element tree rather than assembling an HTML string, so there is no `innerHTML` and nothing to sanitize. Raw HTML in the source renders as inert text, `javascript:` URLs are dropped, and links open with `noreferrer noopener`. A test asserts each of those, because the one change that would undo them — adding `rehype-raw` so an embedded `<br>` works — looks entirely reasonable in isolation.

  Two deliberate design choices:
  - **The type scale is compressed, and headings shift down a level.** This content is a guest inside a page that owns its own hierarchy: an author writing `#` means "the top of my document", not "louder than this page's title", so `#` renders near a section heading and emits `<h2>`. Levels five and six share level four's treatment rather than inventing more sizes.
  - **Fenced code renders through `Snippet`**, so markdown gets the product's own syntax highlighting and copy button instead of a second, plainer code style. Inline code stays a much quieter treatment.

  GFM tables scroll inside their own container rather than making the page scroll sideways, and empty or whitespace-only source renders nothing at all — so a caller need not check before rendering a field that may be blank.

- fd54217: `MediaSurface` fills the box its caller states with an image, or something standing in for one.

  `Avatar` is a **tile**: a small square identifying a party, floating in padding at a rung of the size scale. A card's media slot and a detail pane's full-bleed head are **surfaces**, and the two want opposite things from the same properties. Two of those differences are why routing a hero through `Avatar` breaks:
  - **`MediaSurface` states no radius.** `Avatar` hardcodes `rounded-sm` on its root, image and fallback alike, so a caller cannot remove it — a per-site `rounded-*` is the same utility family at the same specificity, and which one wins is decided by compiled stylesheet order rather than by the order they were written. A tile wants that radius; a surface meeting its container's edges does not, and the corners where it abuts the next block are exactly where the difference shows. Here the caller owns it: a tile passes `rounded-sm`, a full-bleed head passes nothing.
  - **The ground is painted by the root**, not only by the fallback, so an image with transparency sits on the surface's own fill instead of showing whatever is behind it. `Avatar` spreads one `className` onto root, image and fallback together, so a caller cannot back the image without also covering the fallback's fill and stranding the foreground derived from it.

  `fallback` is a node rather than a name, so the surface knows nothing about what it is standing in for; a consumer that has entity types keeps them. Pass `variant` rather than a `bg-*` utility: `variant-static-bg` sets the fill **and** the foreground derived from it, while a caller's utility sits in a later cascade layer and wins only the background — leaving the derived foreground computed for a fill nothing paints, with both classes present and applying, so nothing reports it.

  `Avatar` is unchanged and remains the right component for an identity tile.

- 7ff1178: `NestedRadio` now closes its menu when an option is selected.

  **This is a runtime behaviour change, and the kind a consumer meets at runtime rather than at compile time** — nothing about the types moves, so a version bump alone will not tell you. A radio menu that previously stayed open after a pick now closes.

  The old behaviour was not a considered default but an inverted one: `NestedRadio` called `preventDefault()` whenever `closeOnSelect` was falsy, so leaving the flag unset kept the menu open while the prop's own documentation said it "defaults to true". A single-value control has nothing left to do once its value is picked, so closing is the honest default.

  **Existing consumers are unaffected.** The only one, `axis-settings.tsx`, was already passing `closeOnSelect: true` on every option to work around the old default — which is the clearest evidence the default was wrong. Those flags are now redundant and have been dropped; its behaviour is identical. Anyone adding a `Select` no longer needs the explicit flag to get a menu that closes.

  If you do want a radio group that stays open, that is now the explicit case: pass `closeOnSelect: false`.

  **Unchanged, but worth stating because the surrounding code moved:** `NestedSelect` and `NestedCheckbox` still stay open, and `NestedItem` still closes. Those defaults are now written down and applied explicitly rather than falling out of a falsy check, but no behaviour changed for any of them. The defaults differ by component on purpose — the multi-value controls stay open because closing after each toggle would make selecting two things take two trips, while for an item or a radio option the click _is_ the interaction. `NestedOption` is shared between the single- and multi-value controls, so the default cannot live on the option; the component decides, and the doc comment now records which way each goes.

- e24d20a: `portalContainer` on every overlay component, and no hardcoded `z-index` on the Combobox popup or the 3D tooltip.

  **`portalContainer?: HTMLElement | null` is now on `Modal`, `SidebarModal`, `TabbedModal`, `Dialog`, `Dropdown`, `Popover`, `ContextMenu`, `Select`, `Tooltip` and `TrackedTooltip`.** It was on `Autocomplete` and `Combobox` only. Same signature and same meaning everywhere: the element the popup's portal renders into, defaulting to `document.body`. `TabbedModal`, `SidebarModal` and `Select` forward it to the overlays they compose; `TrackedTooltip` passes it to `FloatingPortal`'s `root`, which is that library's spelling of the same thing. Additive — a consumer passing nothing gets what it got before.

  **It does not yet reach a submenu opened from inside a menu.** `NestedMenu`'s desktop submenu and `NestedCheckboxTree`'s submenu portal to `<body>` unconditionally, and no container reaches them — the `Nested*` primitives are addressed through context rather than props, so threading one there is a separate change. A host that passes a container to a `Dropdown` gets the menu in its container and any submenu at `<body>`.

  **Two hardcoded `z-index`es are gone, and neither is replaced by a number.** The Combobox/Autocomplete popup Positioner no longer carries `z-50`, and the `Tooltip3D` floating wrapper no longer carries `z-50`. **A consumer whose page has its own stacking ladder should pass `portalContainer`** — the element whose stacking context the popup should join — rather than expecting the library to out-rank that ladder. A number chosen here is a guess about a page the library cannot see, and one that only ever has to be raised again.

  **What a consumer with no ladder needs to do: nothing, and that was measured rather than reasoned about.** Overlays portal to the end of `<body>` and stack at `z-index: auto`, which loses to any positive `z-index` reaching the root stacking context. `apps/studio`'s chrome does use one — a side pane's close button is `z-1` — and it does not reach that context, because the pane surface's `.card-transparent` carries a `backdrop-filter`, which establishes a stacking context and confines it. `floating/overlay-stacking.browser.tsx` pins it by hit test in both themes against a real `Modal`; `apps/studio`'s `browser-tests/layout/overlay-stacking.browser.ts` pins the same thing against the running app with a real `Dropdown` and a real `Dialog`.

  **The claim that this covers _every_ overlay rests on a census, not on those overlaps.** The studio suite asserts that nothing anywhere in the app puts a positive `z-index` directly in the root stacking context, save the toast viewport — which declares an explicit maximum because it belongs above overlays. Chrome that grew one, on any route, would beat every overlay in the library at once, and that assertion is the only thing that would say so.

  **`backdrop-filter` on `.card-transparent` is therefore load-bearing, and removing it is a breaking change to overlay stacking.** Measured both ways: with it, an overlay at `auto` paints in front; without it, that close button paints over an open `Dialog`. `@container/pane` on the same element looks like a second line of defence and is not — `container-type: inline-size` computes `contain: none` and establishes no stacking context. Nothing else fails when the filter goes: no type error, no behavioural test, and a screenshot of the common case still looks right, because most chrome does not overlap most popups. Both suites above fail on it and name the missing property.

  **`Tooltip3D` changes stacking behaviour deliberately, and only on its hover path.** The removed `z-50` is on `TooltipInstance`, which serves anchors `useTooltipAnchor` resolves to `interactive: false` — that is `mode: "hover"`. The click and context-menu modes render a Radix menu portalled to `<body>` and are untouched.

  A hover tooltip renders inside the `TooltipHost` container rather than at `<body>`, so at `z-index: 50` it beat overlays portalled after the app — it covered an open `Modal`. At `auto` it **still paints over the app chrome**, measured against the heaviest arrangement there is: a mounted 3D canvas with the animation sheet under it and side tracks beside it. What it now loses to is body-level overlays, which is the ordering a modal should win. A consumer relying on a 3D tooltip drawing over a dialog is the one case that has to change, and `portalContainer` will not restore it — that ordering was the defect.

  `Tooltip`'s content keeps its `z-10`, and `Toast`'s viewport keeps its `z-2147483647`. Both are unchanged and neither is claimed to be right; they are simply not part of this change. `Tooltip`'s is effective at `<body>` level — Radix copies the content's computed `z-index` onto its popper wrapper — so a `Tooltip` now outranks a `Combobox` popup where the two overlap, which it did not before.

  Minor rather than patch: the prop is additive, but the two removals change stacking for existing consumers.

- e387961: Right-region pane controls take their names from the pane, a new `inspect` icon role, and duotone secondary detail at 60% opacity.
  - **`PaneSpec` gains `openLabel` and `closeLabel`.** They name the layout's controls
    for a Right-region pane: `openLabel` the header's side-panel toggle when that pane
    is its target, `closeLabel` the pane's own close button (docked and in the narrow
    layout's shared row) and the header toggle while the pane is the one showing.
    Unset, or set to an empty string, they fall back to "Toggle side panel" and
    "Close panel", so a pane that does not name its controls is announced exactly as
    before. Name them for what the pane is:

    ```tsx
    setPane({
      id: "details",
      // …
      inRightMenu: true,
      openLabel: "Open inspector",
      closeLabel: "Close inspector",
    });
    ```

  - **The header's side-panel toggle stays in place on narrow viewports.** It no
    longer disappears while its pane is open there; it becomes that pane's close
    control and keeps its size and position. Its glyph is `inspect` when it opens and
    `close` when it closes, in place of the rotating `sidebar-toggle`. Above the
    breakpoint it is still hidden while the region is open. The narrow header's
    "Toggle Menu" button is `Size.Md`, matching it.
  - **A docked Right-region pane closes with the `close` glyph** rather than a
    rotating `sidebar-toggle`, the same control the narrow layout already used.
  - **New role key `inspect`** (Solar InfoSquare LineDuotone): reveal the details of
    something.
  - **`preview-open` and `preview-close` are deprecated, not removed.** They keep
    their eye and eye-off artwork. Use `inspect` in place of `preview-open` and
    `close` in place of `preview-close`.
  - **Secondary detail renders at 60% opacity, up from 50%**, across `@semio/ui`'s own
    glyphs, the visibility and audio states included. Solar glyphs built with
    `createSolarIcon` now carry an `icon-solar` class, and the package stylesheet
    raises their 50% duotone layer to 60% through it; `icon-duotone-inverted` dims its
    primary layer to 60% to match. Opacity a component sets from state, such as
    `KeyIcon`'s `fillOpacity`, is unchanged.

  `minor` per this package's pre-1.0 convention: the toggle's behaviour on narrow
  viewports and the glyph changes are visible changes to published components, and
  the rest is additive.

- 959b980: Panes can take the content area's room, or give up their own, without anything being unmounted or measured wrongly.

  Two additions to `PaneSpec`, deliberately separate from `size` rather than more values of it.

  **`expanded`** — the pane spans onto the content column instead of the content track collapsing to make room. `size: "full"` already did the second thing, and it costs more than it looks: it sets `--content-size: 0fr`, so anything that frames itself from the measured content rect is told it has no width. A 3D canvas reprojects to nothing and has to recover on the way back, restoring needs a width remembered from before, and a window resized mid-expansion has nothing to recompute from. Spanning leaves every track exactly as it was:
  - The pane keeps declaring its own width, so restoring needs no remembered state.
  - The content cell keeps computing its natural size, so the rect stays live and truthful the whole time something is covering it — including across a resize, and across a second pane opening.
  - The span ends at the opposite region's grid line, so an expanded left pane reaches the right sidebar and stops.
  - The flag is cleared when a pane leaves a side region, in the same place and for the same reason `openOrder` is: expansion is how a pane occupies a region, so a pane in no region cannot be expanded. Left set, it outlives the close and the pane returns spanning the content the next time it is opened — an arrangement restored from something the viewer thought they had dismissed, with no control on screen still showing it as on.

  `useLayoutState()` gains `leftExpanded`, `rightExpanded` and `contentVisible`, and `LayoutRoot`'s children function gains a second argument carrying `contentVisible`. It is an **optimisation** signal, not a correctness one: the rect is truthful either way, so an occupant that ignores it still frames itself correctly — it just keeps drawing something nobody can see. Occupants that can cheaply idle should.

  **`collapsed`** — the pane takes no space but stays mounted. Freeing a region's space used to mean unregistering the pane, which takes its content with it, and content does not always come back cheaply or identically: the studio's animation panel keeps its height in its own state, so unregistering lost the height the viewer had dragged, and remounting re-created an R3F canvas that measures its container on mount and can latch onto a mid-cascade size. Collapsing makes it a **resize** — the path a resizable pane already takes on every drag. The pane keeps its state, comes back the size it was, and stops holding its region's gap open while it has none. It is `inert` and `aria-hidden` while collapsed, so nothing focusable hides in a zero-sized box.

  It animates, on the same transition the pane enters and exits on, because it stands in for unregistering and has to read as the same act rather than as a snap. The size is animated by motion rather than declared as a CSS transition: a footer's row is sized by the pane's own content, so `h-full` resolves to `auto`, and CSS cannot interpolate `auto` to a length — a transition on it reports a duration and animates nothing. Motion measures the element instead.

  **Every pane is a named query container** (`@container/pane`), so pane content asks how wide _the pane_ is with `@[800px]/pane:`. That is the only correct question for a pane deciding its internal layout: the viewport `desktop:` breakpoint cannot see a right sidebar taking half the room, and a pane that can expand changes width without the window moving at all. Named so nested containers inside pane content stay unambiguous.

  **`setPanes` applies a batch as one write.** It was a `setPane` per item, each rebuilding from a ref mirroring the pane atom through a subscription. That was not observably broken — the writes resolved against the atom's current value and the batch did land — but it was N renders for one intent, and the ref-mirror shape is one the studio has already been bitten by (`use-selection-pane` documents it). `panesAtom` now accepts an updater, every mutator computes from the current panes at write time, and the mirror and its subscription are gone. Expanding one pane while collapsing two others is now a single write by construction.

  No behaviour changes for existing consumers: both new fields are optional and absent, and `size: "full"` still works as it did.

- a64543e: `TableList` is removed, along with `ColumnDefinition`, `TableListProps`, `TableListItem` and `useTableListState`. Use `ListGrid`.

  Two list engines rendered the same idea and drifted apart. `ListGrid` is where the work went: it lays rows on a parent grid with `grid-cols-subgrid` so columns line up across a listing, it collapses a column by container width (`hideBelow`) rather than by a viewport size, it takes a right-click menu per row, and it addresses rows through `getRowId` instead of requiring a `key` field stamped onto every datum. `TableList` had none of that, so every surface still on it was a surface where rows behaved differently — a different height, a different name cell, no context menu — for no reason a reader could name.

  Migrating a call site is mechanical:
  - `data={rows.map((r) => ({ key: r.id, ...r }))}` becomes `data={rows}` plus `getRowId={(r) => r.id}`.
  - `columns` becomes `ListColumn<T>[]`, which is not the same shape: `header` is now optional, `render` takes `(item, { focused, selected })` rather than three positional arguments, and a per-cell `className` belongs on the column.
  - `requiredSize={Size.Md}` on a column becomes `hideBelow`, which is a container query rather than a size rung — a list in a narrow pane now behaves like a narrow list.
  - `selectedKeys` / `defaultSelectedKeys` become `selected` / `defaultSelected`.
  - `size={Size.Lg}` becomes `size={Size.Md}` unless the surface has a reason to be taller: `Md` is the `h-9` row density every list in the product shares.
  - `showIndicators` has no equivalent. `ListGrid` reflects selection with the shared left-edge bar and tint — the same seam `TreeGrid` uses — rather than a radio or checkbox column, so a list and a tree read as one visual system.

  Two behaviours change for every call site, neither of them opt-out:
  - **Arrow keys no longer wrap at the ends.** `TableList` looped by default and nothing passed the prop, so every migrated surface had wrapping; `ListGrid` and `TreeGrid` both stop at the last row. Pass `loop` to ask for the old behaviour. The default follows the tree rather than the retired engine, because a list and a tree sitting in the same sidebar answering the same key differently is the drift this removal exists to end.
  - **Rows are `h-9` at `Size.Md`**, where the old engine's `Size.Lg` was taller. That is the shared rhythm, not a per-list choice.

  `ColumnDefinition` and `TableListProps` go with the component. Of the three type names that named `ListItem` in their constraints, only `CardGridProps` remains.

  The `.table-list` stylesheet block goes with it. Its `.table-list-text` rule only ever applied to descendants of a `.table-list`, so a control carrying that class outside one was already unstyled by it.

- aa3ee48: Right-region panes reach narrow viewports instead of being dropped: both side regions now share one row there.

  `PanelContent` refused to render Right-region panes below `--breakpoint-md`, and the narrow grid had no `right` area to put one in. Between them, a feature placed in the Right pane **changed availability by screen size** rather than presentation: on a phone the selection landed, the URL updated and the pane registered in state, and the panel was simply nowhere.

  The Left region already had a good narrow arrangement — a plain panel in its own full-width row under the content, with the menu bar and footer below it. Rather than introduce a second presentation, the Right region now shares that row:
  - **Wide:** unchanged. Each side region keeps its own track beside the content, and the two dock concurrently.
  - **Narrow:** the `left` grid area becomes `side` and holds panes from either region, sized by `--side-size` — whichever pane is showing. Concurrency collapses to a stack: the most recently opened pane is the one shown, opening another covers it, and closing that one reveals it again. Panes underneath stay mounted, so going back to one returns it as it was left.

  Row heights are identical to before for the Left-only case, so the editor's narrow layout is unchanged.

  Which pane is on top is pane state, not something a component accumulates across renders: `PaneSpec` gains an `openOrder` that `panesAtom` maintains on write. It is managed by the layout — consumers should not set it.

  Also in this change:
  - **Toggling a covered pane brings it forward rather than closing it.** With both regions open below the breakpoint, only the newest is shown, so closing the other one happened entirely off screen — the control read as dead and took two presses to produce the pane asked for. Toggling the pane that _is_ shown still closes it and reveals what is beneath. Above the breakpoint both are visible, nothing is ever covered, and the toggle closes as before.
  - The header's right-pane toggle is shown at every width. It was desktop-only, which made the region unreachable on a phone even once its panes render.
  - Three separate controls answered to the accessible name "Toggle Menu". The right-pane toggle is now "Toggle side panel" and the pane's own close control is "Close panel"; the actions dropdown keeps the original name.
  - A pane in the shared row closes with a `close` glyph rather than the docked pane's sideways `sidebar-toggle`, which described a fold that does not happen there.

- 0050e73: `Select` gains `disabled` — a value the reader may see and may not set.

  The menu will not open and the trigger dims, keyed off the `data-disabled` Radix stamps on a disabled trigger rather than a second copy of the prop that could drift from it. The dimming is `text-neutral-500/50`, the same treatment disabled menu items already use, so a pinned trigger and a disabled option read as one state.

  This is for a setting withheld rather than absent — a rung fixed by a plan or a policy, a field owned by another actor. It is deliberately distinct from the two things it is easy to reach for instead: omitting the control says the value does not apply, and rendering plain text hides that a control was ever there. A reader who cannot tell "no setting" from "a setting you may not change" will assume the former and stop looking.

  **`disabled` does not set `pointer-events: none`**, unlike the disabled state on menu items. Radix already refuses to open a disabled trigger, so suppressing pointer events buys nothing — and it would cost the one affordance left for saying _why_ the control is fixed. A disabled control that withholds its reason is worse than either alone.

  **Attaching that reason needs a wrapping element, not the `Select` itself:**

  ```tsx
  <Tooltip content="Why this is fixed">
    <span className="inline-flex">
      <Select … disabled />
    </span>
  </Tooltip>
  ```

  `Tooltip` uses Radix's `asChild`, which hands its trigger's ref and pointer handlers to its child. `Select` is a plain function component that forwards neither, so passed directly they are dropped and the tooltip **never opens** — with no error, no warning, and a control that looks entirely correct. Worth knowing generally: this applies to any `asChild` consumer wrapping a component from this package, not just this pair. Both the working and the broken form are pinned in `select-disabled.browser.tsx`, so if `Select` later forwards a ref the broken-form test flips to failing and the guidance can be removed with the reason for it.

- 90d1847: `SelectOption` and `NestedOption` take a `description`, shown as a tooltip on the option in the open menu.

  For a menu whose labels are not fully self-explanatory — a permission rung, a mode with consequences — this puts the extra sentence at the point of decision, on every control built from those options rather than once in a block elsewhere on the surface.

  **A tooltip, not a second line inside the item**, and the distinction is the design rather than an implementation detail. An item that grows to hold prose stops matching the interactive rhythm of every other row in the menu, and makes the menu size itself around explanatory text instead of around its controls. Layering the explanation over the option leaves the option exactly the control it already was.

  **Additive by construction.** With no description, `Tooltip` short-circuits and renders the child bare rather than wrapping it in an armed trigger, so an undescribed option is byte-for-byte what it was — no wrapper element, no `aria-describedby`, no change to any existing menu.

  `NestedRadio` and `NestedSelect` both support it, because they share one option type and a field that works in one control while being silently dropped by the other is a trap.

  **It is an aid, never the only home for a fact.** A tooltip needs hover or focus, so it is unreachable by a reader who does not go looking, and it is not an accessible substitute for information required to choose correctly. That belongs in the label, or beside the control where it is always visible.

  Wrapping every item in a tooltip trigger puts Radix's ref and pointer handlers onto the same node as the menu item, which can break selection, roving focus, type-ahead or close-on-select while the tooltip itself works perfectly. `select-option-description.browser.tsx` is therefore mostly negative claims: the item is still a `menuitemradio`, selection still reaches the consumer with the option's value, the menu still closes on select, the accessible name is still the label alone, and an undescribed option carries none of the trigger's attributes. It also carries one positive claim — the description reaches the option through `aria-describedby` — because negatives alone cannot separate a working feature from a deleted one, and every negative above passes with the description never wired.

- f149ca7: Semantic icon roles and Solar artwork across the default registry.
  - **New registry keys (94).** Role keys named for what an icon does — actions and
    states as separate keys (`mute` / `state-muted`, `hide` / `state-hidden`,
    `unlock` / `state-locked`), `retry`, `copy` / `copy-complete`, `add` / `remove`,
    `theme-*`, `sort-*`, `view-list` / `view-grid`, `key-*`, placeholders — plus the
    glyphs behind them: playback multipliers (`playback-0.1` … `playback-2.0`),
    `time-display-*`, `sort-updated`, `folder-open` / `folder-closed`, `box-plus`,
    `data-binary`, `sidebar-open` / `sidebar-close`, `user`, `moon`, `sun-moon`,
    `replace`, `rotate-3d` and others.
  - **New exports:** `createSolarIcon` (wraps a Solar component with the shared 18px
    sizing and an optional presentation class), the `GlyphProps` type every glyph
    accepts (the same shape as Solar's `IconProps`), 24 glyph modules behind the new keys
    (`Playback01x` … `Playback20x`, `IconTimeDisplay*`, `IconFolderOpen`,
    `IconSidebarOpen`, …) and the 27 shared glyphs the roles default to (`IconClose`,
    `IconCheck`, `IconSelector`, …).
  - **Existing keys render Solar artwork.** Stock glyphs (`chevron-*`, `search`,
    `info`, `undo`, `rotate`, `sun`, `layout-grid`, …) and Semio's own glyphs now use
    Solar designs on a 24-unit canvas with 1.5-unit strokes and an 18px default. Keys
    that name a picture rather than a role are marked `@deprecated` with the role to
    use instead; none were removed.
  - **`NodeTree`'s disclosure chevron points down when open and right when
    collapsed**, through `DisclosureIcon`, so it matches every other disclosure and
    follows a consumer's `disclosure-*` overrides. It previously pointed up when open
    and down when collapsed. `Collapse`, `TreeToggle` and the other disclosures keep
    their orientation and now resolve their chevrons through the registry roles.
  - **`@solar-icons/react-perf` is a declared dependency.** The ESM build imports it;
    the CommonJS build bundles the components it renders, because the package is
    ESM-only. Glyph props are declared locally, so the published type declarations
    do not reference it.
  - `NOTICE` carries the Solar (CC BY 4.0 artwork, MIT package code) and Tabler (MIT)
    attributions and permission texts, and lists the glyphs vendored into `dist`.

  `minor` per this package's pre-1.0 convention: the `NodeTree` orientation is a
  visible change to a published component, and the rest is additive.

- 75cafdf: New `IconSphere` glyph, registered as `sphere`.

  A sphere outline crossed by a solid equator arc and a solid meridian arc, for labelling 3D models. It follows the Solar line-duotone convention of the other registry glyphs — a 1.5 primary stroke, the two arcs as the secondary at the shared 60% opacity, `currentColor` throughout, and a `size="18px"` default — rather than the fill-based shape of the older `IconFileType*` glyphs.

  Minor rather than patch: this adds a public export and a `defaultIconRegistry` key. Nothing existing changes, so it is additive for every consumer; the Storybook icon gallery enumerates the registry, so it appears there without a story change.

- fd54217: `StatusDot` reports a state on its own; `Status` is renamed `StatusBadge`.

  **Breaking: `Status` and `StatusProps` are gone.** Import `StatusBadge` and `StatusBadgeProps`; nothing about the component's behaviour changed.

  The old name claimed the whole idea of a status for a component that can only ever _decorate_ something else. `StatusBadge` requires `children` and positions a mark at one of their corners — a count on an icon, a dot on a tile — so it cannot report a state that has nothing to hang on. A listing row, a detail pane's media overlay and a device page all need exactly that, and each was hand-building it.

  No deprecated alias is kept, deliberately: leaving `Status` pointing at the badge alongside a `StatusDot` preserves the ambiguity the rename exists to remove, and defers the same edit rather than avoiding it.

  `StatusDot` renders the mark and nothing else:
  - **`srLabel` wherever no visible text names the state.** A bare dot encodes state in hue alone, and nothing about a coloured circle reaches a screen reader — so a dot standing on its own reports nothing at all. Omit it only where the words are already adjacent and announced, such as inside a `Chip` whose own label says the state; passing one there makes it announce twice.
  - **`mark` replaces the dot** for a state that is still resolving, so a spinner takes the dot's box instead of spinning on top of it.
  - **It knows nothing about what the state is.** A consumer maps its own domain onto a `Variant` and keeps that mapping, so the library carries no assumptions about any one app's states.

  To show a state in words, compose the dot into a `Chip` — it carries no label and no ground of its own. See the `visuals` changeset for that pairing.

- ef61a12: `TextArea` takes a `size`, the type scale its sibling inputs already use.

  It had none, so its text inherited whatever the surrounding font was while a `TextField` or `Combobox` beside it sized itself from the shared scale. In a settings row that put a 16px text area next to a 12px field — a pair read together, each control correct on its own, and nothing to catch the mismatch.

  Opt-in, with no default: without one the text inherits, which is what existing callers get today, so a default here would resize them.

  Only the type scale. Height stays with `rows`, the element's own way of saying how many lines it stands open at.

- 91d1ed0: `TextField` (and therefore `Search`) accepts `visuals="inverted"`: no outline of
  its own, sitting on a translucent fill that brightens on hover. For a field
  inside something that already draws the only border — a toolbar card, a pane
  header, the animation sheet's track filter.

  This recipe already existed in three places as copy-pasted utilities
  (`outline="hidden"` plus `bg-neutral-500/10 hover:bg-neutral-500/25`), which is
  how the three came to differ in small ways. The variant owns both halves, so a
  caller can no longer suppress the outline and forget the fill, or the reverse.

  Named to match `Button`'s `visuals="inverted"`, since reading as one control set
  with those buttons is the point of it. Additive and defaulted to `"default"`, so
  every existing field renders unchanged. It is distinct from `bg`, which paints a
  lighter fill and does not respond to hover.

- fe7ec2d: `Text` and four named text roles, so a run of text declares what it is rather than how big it is.

  `value`, `label`, `caption` and `body`. Each resolves to a rung of the size scale, a light/dark colour pair and whether the text can be selected — and roles are allowed to share a rung, which is the point. A fact's value and the label naming it are both 14px; what separates them is that one is content a reader will want to copy and the other is chrome that happens to be words. A size scale cannot say that, so a `Text/*` style maps onto these many-to-one rather than one-to-one.

  **Four roles is a starting set, and adding one is two edits.** A member on `TextRole` and one block in the stylesheet: everything shared is matched on the `text-role-` class prefix, so it applies to a hand-written class as well as one the component emits, and the Storybook story and browser tests both derive their lists from `Object.values(TextRole)`. A role added without its stylesheet block reddens rather than shipping unstyled, and three independent checks catch it: the light/dark pair test, the bare-class paint test, and `parity:figma`, which requires a `.text-role-<name>` rule per enum member. Verified by adding a fifth role with only an enum member — `2 failed | 28 passed (30)`, the test count having grown by four on its own, and `parity:figma` exiting 1 naming the missing block.

  That matters because the right role set is not yet known. Of the 67 sites the rule reports in `apps/studio` (63 with no dark counterpart, 4 whose dark equals their light), only 12 map cleanly onto a role: 10 onto `caption` and 2 onto `label`. Of the other 55, six are foregrounds on saturated fills and are not role sites at all — the fill does not flip with the theme, so a dark counterpart applies over the same ground and drops contrast rather than preserving it. The remaining 49 are 27 at `text-sm` and 22 with no size class, and they are a mix of field labels, group headings, instructional headings and empty-state prose that each need a read. The 27 are the ones that force the question: 14px muted matches no role, since `value` and `body` are 14px but darker and `caption` is muted but 12px.

  **A MUTED role's colour is a lightness, and the variant supplies the hue.** `label` and `caption` name a target lightness and take chroma and hue from whatever `variant` is in context, so a caption inside a `responsive primary` subtree is primary-hued at exactly the lightness a neutral caption would have had. `value` and `body` stay neutral: they are defined by being high-contrast, which puts them where sRGB has almost no chroma to give — at `value` in dark the gamut keeps 9% of primary's chroma and 8% of error's, landing the two 0.007 apart, indistinguishable. Deriving them would offer a colour the gamut cannot supply and flatten two variants into one. Naming a rung per variant — `text-<variant>-500` — is the obvious spelling and cannot be made to work: a rung is a position in ONE family's ramp, and the families are anchored at their brand's own lightness, so `neutral-500` is L 55.6 where `secondary-500` is L 78.0. Measured across the palette, the body↔muted gap that makes a caption read as secondary ranged from Lc 9.8 to 46.7 by variant; at the bottom of that range the two are indistinguishable. Assigning the lightness collapses that spread to 8.0 in light and 16.3 in dark. Regularising the ramps does not fix it — measured, and it moved the light spread only from 24.1 to 22.9.

  **The default variant is not a special case**, which is the point. Its accent has zero chroma, so deriving from it reproduces the neutral rungs exactly — pinned in the browser tests to three decimals against 900/800/500 and 100/200/400, so the change is invisible to every existing caller. The muted pair still names its neutral colours, because an `@supports` gate leaves those in force wherever relative colour syntax is unavailable.

  **The class is the load-bearing part; the component is the named target.** Both halves of each pair are declared in one `.text-role-*` class under `@layer components`, so a caller's `text-*` utility overrides it WHOLLY — utilities sit in a later cascade layer, so the utility wins in both themes. Had the component spread `text-neutral-900 dark:text-neutral-100` into its own class list instead, a caller's `text-neutral-500` and the component's `dark:` class would be two utilities in one layer, both would survive, and the result would be a light-mode change with dark mode left behind. `text.browser.tsx` pins this by measuring the override in both themes against the un-overridden role as its control; moving the block out of the layer reddens exactly that test.

  **Selection belongs to the role.** `LayoutRoot` sets `select-none` app-wide so the product reads as an application rather than a document, and content opts back in while chrome does not. The tint is the one text inputs already carry, so a drag crossing from a field into surrounding copy does not change colour halfway. `--accent-color` is only defined inside `.responsive`, which the layout root does not carry, so each role class declares a per-theme fallback — without it ordinary copy would select in the browser default, which no screenshot would reveal.

  `role` deliberately shadows the DOM `role` attribute and does not forward one: ARIA roles describe a region and belong on the container, and TypeScript makes the collision a compile error rather than a silently dropped attribute.

  Three Storybook stories under `ui/Text` render both themes side by side rather than through the theme toggle — a missing dark half looks perfectly fine in whichever mode you are viewing, which is why the defect survives review. The selection story selects the content for you, since `::selection` cannot be inspected passively.

  Also adds `semio/no-unpaired-neutral-text` to `@semio/eslint-config`, registered for every consumer and **off**. It reports a light `text-neutral-*` with no `dark:` counterpart, and separately reports a pair set to the same shade — the latter being what applying the house `dark = 1000 - light` produces at 500, the one shade that is its own inverse. It turns on once the surfaces it guards carry roles; enabling it before that would only pressure sites into a pairing that the migration deletes.

- e293941: The variant context root class is `variant-scope`, not `responsive`.

  `responsive` collided with two other meanings a reader reaches for first — the
  stylesheet's own `variant-responsive-*` treatment axis (hover/press/selection
  state) and the web's ordinary sense of the word (breakpoints) — so a class
  whose job is to declare `--accent-color`, `--variant-text-color` and the
  on-fill foregrounds for everything beneath it could not be read correctly
  without already knowing the answer.

  Any call site that applies the root class by hand — `className="responsive primary"`,
  a Code Connect mapping, a Storybook story — needs `variant-scope` instead.
  `variant-responsive-*` and `variant-static-*`, the treatment classes the root
  provides context for, are unchanged. There is no compatibility alias for the
  old name: it would preserve exactly the ambiguity this rename removes.

### Patch Changes

- cf826a7: `.app-layout`'s side tracks can give width back, so a cramped desktop window no longer paints outside the layout.

  `desktop` is width-only at 768px, but the docked arrangement needs room for the menu rail, a left pane, a content column _and_ a right pane. Between those two numbers the grid is overconstrained, and the side tracks were rigid lengths — `var(--left-size)` and `var(--right-size)` with no `minmax` — so it resolved by overflowing. Two symptoms, one cause:
  - `overflow-x: clip` swallowed the overflow, so the right sidebar was not on screen at all, with nothing to indicate it was there.
  - The menu, squeezed below its own content width, was painted over by `Header` and the side panes — later siblings, so they win — clipping the wordmark and every nav label.

  Both tracks are `minmax(0, …)` now. Where everything fits, `minmax(0, L)` resolves to exactly `L`, so a roomy layout is unchanged; where it does not, the panes narrow instead of one of them vanishing.

  Pinned by `narrow-desktop-fit.browser.tsx`, which measures geometry at two real viewports — the right pane inside the layout, and nothing starting left of where the menu ends — with a roomy control so the cramped assertions cannot pass on a layout that simply failed to render a pane.

  A floor rather than the whole answer: the stacked arrangement below `desktop` is the right shape for a genuinely narrow window, and it still engages at 768px rather than at the width this grid actually needs. Raising that threshold is a design decision about pane widths, not a bug fix.

- 7ac1802: `Autocomplete` no longer writes a serialized item object into its input when one is picked.

  Items are handed to the primitive as objects (`<Autocomplete.Item value={item}>`), and with no way to convert them it stringified the object straight into the field — picking a person turned a people search into `{"id":"…","userId":"…"}`. It writes that value **after** `onSelect` runs, so a consumer clearing its own state in the handler was overwritten and had no way to defend against it.

  `itemToStringValue` is now passed through, and **defaults to clearing the field**. The wrapper cannot infer the right string on a consumer's behalf: it knows how to render an item (`renderItem`) and how to key one (`getItemKey`), and neither is display text — a key is an id and would be just as wrong in the box. Writing nothing is the honest default, and a consumer that wants the chosen label left in the field now says which field that is.

- 81ded72: `Avatar` renders through Base UI's avatar primitive instead of Radix's.

  No API change: the same `Root`/`Image`/`Fallback` parts with the same fallback semantics — shown when the image fails or is absent — so every call site is untouched. This package is migrating off Radix, and `MediaSurface` already wraps the Base UI primitive; leaving `Avatar` on the other one meant two components wrapping two libraries to do the same thing.

  The remaining Radix wrappers move as the migration reaches them, not ahead of it.

- fa5efd3: `Avatar`'s status-less wrapper no longer adds a box of its own.

  When no `status` is given, `Avatar` wraps its root in a plain `div`. That div carried no styles and no height, so an avatar asking to fill its container resolved `100%` against an auto-height parent and collapsed to its content — one told to fill a 155px card came out 40px tall. The wrapper is now `display: contents`, so it takes part in no layout.

  Only container-sized avatars could see this: a `size`-driven avatar never asks its parent for a dimension. It surfaced when listings began sizing their own tiles.

- f9a9ad1: `CardGrid`: a plain click selects instead of toggling, and roving focus no longer selects on its own.

  Two defects that only a live-DOM test surfaced, both from the same collision. The composite moves roving focus on pointer-down, so with selection following focus an item was selected _before_ the click handler ran; `useListState.handleItemClick` then saw it as already selected and applied its toggle. The net effect of a plain click was an **empty** selection. Consumers driving selection from controlled state and ignoring empty sets — as the studio assets browser does — masked it entirely.
  - Click selection is now spelled out in `CardGrid` rather than delegated: a click always selects, never toggles, which also makes the grid sticky by default (what a click-to-preview surface wants). `Escape` clears, and `multiple` mode keeps Cmd/Shift for additive gestures.
  - Selection follows focus only for _keyboard_ navigation without Cmd/Ctrl, tracked on capture-phase listeners so the cause of a highlight change is known before the composite reports it. Previously Cmd+Arrow moved the selection despite being focus-only, and a click on an embedded button changed the selection despite the interactive-element guard, because the focus-driven path bypassed it.

  Also adds a `style` passthrough for the grid container, for callers that set their tracks without utility classes.

- 9e6378f: `CardGrid` excludes clicks originating in an interactive descendant from `onItemDoubleClick`, as it already did for selection.

  A card carries three verbs — the background selects, the image inspects, the title navigates — and they stay separate only because a click starting inside a link or a button is not the card's click. `handleClick` applied that exclusion; the double-click path called straight through without it. So double-clicking a card's title link fired navigation _and_ inspection, and double-clicking the overflow button opened the menu and the inspector together — exactly the conflation the three-verb split exists to prevent.

  Same `INTERACTIVE_SELECTOR` as the single-click guard, applied inside the component rather than in each consumer's adapter, so the two paths cannot drift apart again.

- b0cd78f: `Card`'s media slot now carries the card's inner corner radius.

  The card's own `overflow-hidden` does not round it. A child that establishes its own clip is trimmed to the _padding box_ with square corners, so an image in the media slot showed a hard 90° edge cutting across the border's curve at the two top corners — subtle at a card's 4px radius, obvious once a real preview image fills the slot instead of a centred glyph.

  The value is `calc(var(--radius-sm) - 2px)` — the radius `.card` uses, less its border width — rather than a literal `2px`, so it follows the card if either changes. Only the top corners are set, since that is where this slot meets the edge.

- 6e3f609: `Chip`'s label is now legible in dark mode.

  The label element carried `dark:text-red/75 text-white/75`. `text-red` is not a colour Tailwind emits — the scale needs a number — so that declaration was dropped and the chip rendered `text-white/75` in **both** modes. Since the chip's fill comes from `variant-responsive-bg`, which inverts with the theme (a mid-tone accent on light, a light one on dark), one fixed text colour can only be legible in one of them: white text on the light dark-mode fill had almost no contrast.

  Now `text-white/75 dark:text-black/75` — the same white-on-light / black-on-dark pairing the chip's own icon and delete slots already use against that fill.

  Worth knowing if you extend this: the root's `variant-responsive-text` is _not_ the right source here, even though the label overriding it is what caused the bug. That class resolves to `--weak-accent-text-color`, which is accent-coloured text intended to sit on the page background (as an inverted `Button`'s label does). Letting the label inherit it makes a filled chip's text nearly the same colour as its own fill.

- 57ce815: `CardGrid` / `GridNavRoot`: Up/Down is resolved from geometry, and the `ResizeObserver` is gone.

  Vertical navigation used to be the Base UI composite's, driven by a `cols` prop — a number that exists nowhere in CSS. It had to be read back out of the resolved `grid-template-columns` on a `ResizeObserver` and handed in, which is a layout fact reconstructed in JavaScript and then kept in sync by hand.

  `GridNavRoot` now answers Up/Down itself: nearest row in the travelled direction, then nearest horizontal centre within that row. It asks the DOM which box lies below the cursor, so it cannot disagree with what the viewer sees, it needs nothing observed, and a partial or uneven final row needs no special case.

  Two things follow that a column count cannot give. A **partial last row** now moves: with four columns and six items there was no `index + cols` below the fourth card, so Down did nothing at all, where geometry lands on the nearest card in the row below. And it **cannot disagree with the screen**: `grid-template-columns` is a declared value, true only if the items are really laid out by those tracks — and in this package's own test harness they were not, because the composite's `display: contents` comes from a utility class and the compiled stylesheet is absent. Every item was stacked in a block while the count reported three, so the arithmetic and the assertions agreed with each other and neither matched the render.

  `GridNavRootProps.cols` is removed. `CardGrid` was its only caller and its own props are unchanged; the composite keeps Left/Right, Home/End, `aria-disabled` skipping and wrapping, now at `orientation="horizontal"`.

- d9b51af: Ship the MIT license text in the package tarball, and make the third-party icon
  attributions in `@semio/ui`'s and `@semio/animation`'s `NOTICE` self-contained.
  The versions on npm declared `"license": "MIT"` while carrying none of its text,
  and the `NOTICE` files referred to a repository-root document that is not in the
  tarball — so `changeset publish` has to cut a release for the fix to reach a
  consumer.
- c03d3fe: `ListGrid`: a click that starts on a LINK inside a cell no longer selects the row.

  `a[href]` joins the interactive-descendant escape hatch that already exempts buttons, inputs and menu items, on both the click and double-click paths.

  Rows can now carry more than one verb. The studio's listings put three on a row — the background selects, the thumbnail (and a double-click) shows the row in a detail pane, and the NAME navigates — and navigation has to be a real anchor rather than an `onClick`, or middle-click, cmd-click and "open in new tab" simply do not work. Without this, following such a link also moved the selection on the way out, so the gesture did two things and the viewer saw the second one only if the navigation was to a new tab.

  No behaviour change for a listing whose cells contain no links.

- da054ab: `ListGrid` in `selectionMode="none"` is a grid its rows and cells actually describe

  That mode renders `role="grid"` with `role="row"` rows, and neither the rows nor the
  cells said what a grid needs them to.
  - **Cells now carry `gridcell`**, and the column header is `role="row"` with
    `columnheader` cells. Unroled cells are generic, the accessibility tree prunes them,
    and every row was left owning nothing — `axe-core` reported `aria-required-children`
    on all of them. `ListRow` takes the cell role as a `cellRole` prop, unset under
    `option`, which owns no cells.
  - **The grid states `aria-rowcount`, and each row `aria-rowindex`**, counted against the
    full data rather than the rendered slice, so a windowed grid reports the rows it has
    not mounted. A `grid` has no property with which to state a set size, so previously it
    could not. The header counts as row 1; a `noHeader` grid numbers from its first datum.
  - **Rows no longer also carry `aria-setsize`/`aria-posinset`.** `row` permits that pair,
    but there it means position among sibling rows at one level — a `treegrid`'s question
    — and on a flat grid it restates `aria-rowindex` in a second vocabulary.

  `listbox`/`option` and `tree`/`treeitem` are unchanged and keep setsize/posinset, which
  is the only way either places its items.

  `TreeNavRoot` also stops emitting `aria-orientation`. It is vertical by construction,
  `tree` and `listbox` are both vertical by default, and `grid` does not define it.

- af004b1: `ListRow` cells fill the row's height, so an outlined or focused control in a cell is no longer clipped.

  The row is `items-center`, so each cell was exactly as tall as its content — and `truncate`'s `overflow: hidden` then clipped anything painted _outside_ the content box. `Button`'s `inverted-border` visual is an `outline`, and outlines paint outside the box, so an outlined button in a cell lost its top and bottom edges and rendered as two floating side strokes. Focus rings on any embedded control had the same problem.

  Cells are now `self-stretch` with their content still centred by the cell's own `items-center`, so the rendered layout is unchanged and every cell simply has room around its content. Note that shrinking the control was not a fix: the cell hugged it at any size.

- 4329e93: `Modal` and `SidebarModal` open with a fade and a short vertical slide instead of a scale.

  Scaling repaints the entire subtree at a changing size: at `scale-90` a 16px glyph paints at 14.4px, every intermediate value is fractional too, and the box beneath it resizes at the same time. Fine artwork visibly slides inside boxes that never moved and then settles when the transition ends. Sizing glyphs in whole pixels does not help — that fixes where they sit at rest, and the animation is what moves them.

  Translating has no such effect. Nothing is resized, so a 16px glyph is 16px at every frame, and over a whole-pixel travel resting at exactly `translate: none` the final rasterization is the one the element would have had with no animation at all. Measured mid-transition at an 8px offset, every glyph in a modal still sits at an integer width and a whole-pixel x.

  **Keep the travel a whole number of pixels.** A fractional distance puts the subtree off the pixel grid on the way and can settle visibly at the end, which is the failure this replaces.

- 856f872: `NumberField` and `SliderNumberField` keep their units suffix inside the field, whatever the unit's length.

  A unit is free text from whoever authored the value, and the suffix was sized to its full length, so a long one ("intensity", "dimensionless") ran past the field's right edge and over whatever followed it in the row. The suffix is now at most four characters wide, plus padding:
  - **Up to four characters shows in full.** Symbols and abbreviations such as `°`, `%`, `mm`, `fps` and `mm/s` are unaffected.
  - **A longer unit is cut with an ellipsis** wherever it does not fit. At the smaller sizes that is from its fifth character.

  The truncation is visual only: the suffix's value is the whole unit, so a screen reader announces all of it.

- e0baad1: Derive every on-fill foreground from the fill it sits on

  A component painting content on a variant fill now takes its foreground from that
  fill's lightness rather than from the colour scheme. `--standard-color` — what
  `variant-responsive-bg`, `variant-static-bg` and a checked `variant-checkbox-bg` paint
  with — is the -500 shade and has no dark-mode override, so a `text-white
dark:text-black` pair on it is wrong in one theme for every hue. The saturated hues
  failed in light mode and the neutral default failed in dark, at 4.43:1.

  `--on-standard-color` joins `--on-accent-color` as the derived foreground for that
  fill, and each fill class now declares its own foreground for every state it fills.
  Affected components: `Button`, `Avatar`, `Chip`, `Status`, `Checkbox`, `ToggleSquare`,
  `ImageInput`, `Tabs`, `Tooltip`, and the checked menu indicators used by `NestedRadio`,
  `NestedSelect` and `NestedCheckbox`.

  On a `--standard-color` fill every variant now measures **the same in both themes** and
  clears WCAG AA, worst case 4.74:1 against a previous worst of 1.00:1.

  On an `--accent-color` fill — a hovered `Button` or `Avatar`, a checked menu indicator,
  an inverted `Tooltip` — one case does **not** clear AA. `error` in light mode lands at
  4.41:1, because that shade sits just above the derivation's lightness threshold and
  takes black where white scores 4.76:1. It is a small regression for that one
  variant/theme/state against the hardcoded white it replaces, accepted deliberately: the
  threshold picks the better extreme for 190 of 194 palette colours, and moving it to win
  this case trades it for others. It is pinned by test as a floor, not left to drift.

  `Tabs` and an inverted `Tooltip` are not "the same in both themes" and are not meant to
  be — their grounds legitimately flip with the theme, so their foregrounds do too.

  Three of these were consumer-visible in a published release:
  - `Button`'s `primary` variant, reported against `@semio/ui@0.1.4`.
  - `Chip`'s label, which also loses the 75% alpha that cost it a further stop of
    contrast. Its `children: string` typing and missing `className` passthrough are
    unchanged.
  - `ImageInput`'s fallback initial, which paired `variant-responsive-text` with
    `variant-responsive-bg`. Both resolve to the same -500 shade, so the initial painted
    at exactly 1.00:1 — invisible for every named variant in both themes.

  `Status`'s counted badge is resized as part of this. Its text form hardcoded a 10x10
  box with 4px of padding around 7px type — so the `size` prop did nothing (`xs` and `xl`
  rendered identically), the 2px content box could not hold its own 10.5px line box, and
  the width came from an inline `text.length * 6` that tracked neither the font nor the
  padding. It now takes a `sized-status-text` scale running 12px to 20px with type from
  8px to 12px, declared in rem so the badge scales with the reader's text-size setting as
  one thing rather than growing a larger box around the same numeral. Its width comes from
  content, so a multi-digit count widens into a pill instead of crowding, and its glyph is
  semibold rather than bold — at this size the heavier weight closed up the counters. The
  dot form is unchanged.

  `Tabs` changes appearance beyond contrast: brand-variant labels are clamped to a
  lightness that reads on the tab list's ground, so a bright hue renders darker in light
  mode and lighter in dark. The hue is preserved, and the bound is one-sided, so a
  variant already dark enough is untouched.

- ef61a12: A control with a persistent outline now signals focus the same way one with an appearing outline does.

  `variant-responsive-persistent-outline` marked focus by thickening its resting line from 1px to 2px, at offset 0, in the same neutral. Held hard against the fill, that reads as the control's edge closing in on its own text rather than as a ring arriving around it — and it contradicted the class's own hover rule, which lifts the edge to the accent, because `:focus` pinned the colour back to `--standard-color`. Focusing a hovered field therefore went backwards at the moment it became the field being typed in.

  Focused, it is now indistinguishable from `variant-responsive-appearing-outline`: the accent colour, a 2px ring, 2px of offset. The two variants differ only in what they show at rest, so focus has one appearance across the package rather than one per styling choice made elsewhere. `outline-offset` joins the transition, since it is what holds the ring clear of the fill and would otherwise arrive as a jump.

  This reaches every control that draws a resting edge — `TextField`, `TextArea`, `Combobox`, `Autocomplete`, `NumberField`, `SliderNumberField` and `ChipInput` with `outline="always"`, plus `Button` and `Avatar` with `visuals="inverted-border"`. Their resting appearance is unchanged; only what they do on focus is.

- e14141d: `useRowWindow` no longer observes a row's height when the list is not being windowed.

  `measureRef` built a `ResizeObserver` whenever a consumer attached it, and both composed grids attach it unconditionally — so an unwindowed `ListGrid`/`TreeGrid` kept an observer alive to maintain a `rowHeight` that only the window arithmetic reads, and that arithmetic is bypassed entirely when `enabled` is false. One observer per list, for a number nothing consumed.

  The visible consequence was elsewhere: it made `ResizeObserver` an unstated requirement of rendering a plain `TreeGrid`. jsdom does not provide one, so a unit test that rendered a tree — with no interest in windowing and no `virtualized` prop — died on `ReferenceError: ResizeObserver is not defined`. That is a requirement the component had no business imposing, and polyfilling it in each downstream test suite would have spread the assumption rather than removed it.

  Windowed lists are unchanged: with `enabled` true the observer attaches exactly as before, including the continuous re-measurement that keeps a list from locking in the height of a row that mounted before its styles.

  Worth knowing if you extend this: `enabled` is now a dependency of the `measureRef` callback, so the ref identity changes when a list is switched between windowed and not. React detaches and re-attaches on that change, which is what disconnects the old observer — the effect-based cleanup is the backstop, not the mechanism.

- 196a346: Three windowing fixes from review of the row-window work: a coalesced scroll update that could hide a row, and two diagnostics that described behaviour the code does not have.

  **A sub-row scroll that uncovers a row is no longer coalesced away.** Scroll updates collapse to at most one render per row crossed, and the key for that was the first visible row alone. The exclusive end is derived with `ceil`, so one pixel of scroll can move it while the first row stays put — at 20px rows in a 200px viewport, `0 → 1px` leaves the first row at 0 and takes the end from 10 to 11. Keyed on the first row, that update was skipped and the newly-uncovered row stayed behind the trailing spacer until the next whole row was crossed. Both ends are now tracked.

  Only reachable at `overscan={0}`, since the default of 6 rows more than covers one row of drift — which is why it is worth naming: it would have surfaced as one consumer's blank strip rather than as anything the default configuration shows. Pinned by a test that fails against the old key.

  **`useRowWindow` no longer claims it falls back to rendering every row.** Its development warning for an unattached `scrollRef` said "every row will render". It does not: with no viewport to measure, the hook keeps the first-paint estimate, so only the first screenful renders and the rest of the list sits behind a spacer nothing will ever scroll. Only the `enabled: false` path returns the whole range. The warning now describes what actually happens, which is the more alarming of the two and the reason to fix the call.

  **Requesting windowing without a scroll container is now diagnosed.** `ListGrid` and `TreeGrid` resolve `enabled` from `virtualized && scrollRef !== undefined`, so omitting `scrollRef` left `enabled` false — nothing was misconfigured from the hook's point of view, no warning fired, and the list quietly rendered every row at whatever cost the consumer was trying to avoid. `UseRowWindowOptions` gains `requested`, which both grids pass as the raw `virtualized` flag, and the hook warns when windowing was asked for and is not happening. It defaults to `enabled`, so a direct caller that resolves its own condition is unaffected.

  Also corrects the testing section of `docs/windowed-lists.md`, which still told readers to hand-write stand-in CSS rules because the suites run unstyled. Layout suites now import `test-stylesheet` and get the real compiled stylesheet; the stand-in approach it described is the one that was removed, and such a test can only agree with itself — change `h-9` or `grid-cols-subgrid` and it keeps passing while the product breaks.

- 69c2ecd: `ScrollArea` no longer shows scrollbars for content that fits.

  `scrollWidth`/`scrollHeight` and `clientWidth`/`clientHeight` are integers by spec. Where a viewport's box lands on a fractional size — routine at a fractional device pixel ratio, i.e. a scaled display — WebKit rounds the pair in opposite directions and reports `scroll = client + 1` for content that fits exactly. Radix decides scrollability from precisely that comparison (`offsetHeight < scrollHeight`), so it raised a scrollbar for content that fits.

  Measured in the app at `devicePixelRatio` 2.3: a 564.198px-tall menu reporting client 564 / scroll 565 while holding 143.967px of content, and a 750.870px-wide panel reporting client 751 / scroll 752 with content exactly as wide as its box. Hiding every descendant in turn reduced neither, confirming no element was responsible — the container's own box was.

  `getBoundingClientRect` is not rounded, so the scrollbars are now gated on a fractional comparison of the content box against the viewport, with a half-pixel tolerance. Sizes only, so it is independent of scroll position. Migrating to `@base-ui/react`'s scroll area would not have helped: it makes the same integer comparison (`clientHeight >= scrollHeight`).

  An axis with nothing to scroll is also taken out of scrolling altogether. That is a second scrollbar, not belt-and-braces: Radix sets `overflow: scroll` inline on both axes and hides the browser's own bar with `scrollbar-width: none` plus `::-webkit-scrollbar { display: none }`, and in WebKit that does not work — verified in Safari 26.6 with both rules applied and `scrollbar-width` computing to `none`, an axis reporting one rounded pixel of overflow still painted a native bar with none of ours in the DOM. Nothing can be styled away that the engine draws outside the element, so the axis stops being scrollable while the same measurement says there is nothing to reach, and regains it the moment content grows.

  Also adds `data-testid="scroll-area-scrollbar"` to the rendered scrollbars. Radix identifies only its viewport in the DOM, which left this decision unobservable from a test.

- da5c118: `Select`'s caret takes the explicit per-size glyph step instead of a fraction of its box.

  The caret was rendering through `.icon-standard`, which is 3/5 of its container: 16.8px inside a 28px `Sm` trigger, centred at a 5.6px offset. `.sized-icon` exists for exactly this and already says why where it is defined — _"a fraction lands on fractional pixels at most sizes… and a fractional glyph box is a subpixel rendering box"_ — so the artwork is rasterized at one rounding while the control composites and another when it does not, and the caret appears to shift inside a box that never moved. Its trigger simply never opted in.

  Every select's caret is now on whole pixels at every size: 16px in 28px at `Sm`, 20px in 32px at `Md`.

- f72e3a7: `Text` keeps its role's colour under `VariantMode.Static` when no `variant` is named, forwards native `aria-*` / `data-*` / `style` / event props to the element it renders, and `.text-role-label` carries its own `select-none` rather than inheriting one from the app root.
- 34ea216: New `UiStoreProvider`, which scopes the package's own state — the pane registry, the toolbar and action items, the menu state — to one subtree.

  Without it those atoms resolve to jotai's module-global default store: one store per imported module, shared by every tree that reads it and outliving all of them. A single app on a single page cannot tell the difference, which is why this is additive rather than a behavioural change for an existing consumer. A host that mounts an app repeatedly in one page — a test runner, a docs page rendering several examples — can: panes registered by one mount are still registered when the next one starts, and it comes up with a layout nobody asked for.

  Render it once at the root, above anything that reads a layout hook. It takes no store: jotai's `Provider` creates one per mounted instance, which is the lifetime the component exists to promise. Two of them in one app is two disagreeing layouts — a header reading one store while the panes are registered in the other.

  `useLayoutActions` now passes that same store to its `observe` subscriptions. Left to itself `observe` binds the default store, so under a provider the mirrors it maintains would track state nothing writes to, and every action that folds an update into one — the menu toggle, the toolbar and action-item merges — would fold it into an empty snapshot.

- Updated dependencies [d9b51af]
- Updated dependencies [856f872]
- Updated dependencies [10cdce0]
  - @semio/utils@0.3.0

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
