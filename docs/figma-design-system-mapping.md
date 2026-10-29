# @semio/ui → Figma mapping (shared patterns)

The point of this doc: the styling in `@semio/ui` lives in **shared classes** (`public/styles.css`), not per-component, so the same handful of patterns drive Button, inputs, selects, chips, etc. Mapping those classes to Figma **once** — learned from the Button — means every other component reuses the same recipe. Pair with the `figma-component-fidelity` skill (the build process + Figma gotchas) and the `parity:figma` check (the gate).

Token resolution is brand-driven: a `variant` class sets `--standard-color` / `--accent-color` CSS vars, which resolve through the `Brand` collection (Default/Semio) → `Color` semantic vars → primitives. In Figma, bind to the **semantic** vars (`color/<variant>/bg`, `bg-hover`, `fg`); the active Brand mode picks the hue (blue under Default, orange under Semio).

## Visual treatments (the `visuals` axis)

| Code (`visuals`)             | Shared classes                                                                | Meaning                                | Figma representation                                                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `default` (solid)            | `variant-responsive-bg` + `variant-responsive-appearing-outline` + white text | filled bg; **offset focus ring**       | fill → `color/<variant>/bg`; hover → `bg-hover`; **focus ring = discrete offset rect** (2px gap, stroke `bg-hover`, 1px hover / 2px focus); text/icon → `fg` |
| `inverted` (text)            | `variant-responsive-text` + `outline-hidden`                                  | colored text, transparent, **no ring** | no fill; text/icon → `color/<variant>/bg`; **no focus ring**                                                                                                 |
| `inverted-border` (bordered) | `variant-responsive-text` + `variant-responsive-persistent-outline`           | colored text + **always-on border**    | no fill; text/icon → `color/<variant>/bg`; persistent border stroke → `color/<variant>/bg` (1px, focus 2px)                                                  |
| `call-to-action`             | `cta-button`                                                                  | special/gradient                       | one documented example (edge case)                                                                                                                           |
| `list-item`                  | inherits parent                                                               | —                                      | one documented example (edge case)                                                                                                                           |

Key shared pattern: **the offset focus ring (`appearing-outline`, `outline-offset-2`) belongs to _solid_ controls**; text variants suppress it (`outline-hidden`); bordered uses a _persistent_ outline. Inputs/selects that use `variant-responsive-appearing-outline` get the **same offset-ring recipe** — reuse it, don't reinvent.

## States

| State    | Code                                                                   | Figma                                                                                  |
| -------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Default  | base                                                                   | base                                                                                   |
| Hover    | solid: bg→`--accent-color`; text/bordered: (per visual)                | solid: fill→`bg-hover` (+ ring); inverted: none; bordered: border                      |
| Focus    | `appearing-outline` → `outline-2` (solid); persistent → 2px (bordered) | offset ring 2px (solid); border 2px (bordered); none (inverted)                        |
| Disabled | bg/outline → `color-mix(… 50%, transparent)`                           | **node opacity ≈ 0.45** (paint-level opacity is reset to 1 on bound fills — see skill) |

Model states with an **interactive component** (toggle), not a state variant axis, to avoid combinatorial blow-up.

## Variant & size

- **variant** (`primary`/`secondary`/`tertiary`/`default`/`error`/…): selects the `color/<variant>/*` token set. In Figma a variant **must be predefined** to be usable (no on-demand like the code prop) — define the ones you need.
- **size** (`size-xs|sm|md|lg|xl` + `sized-text`/`sized-height`/`sized-width`): dimension tokens. `fit` opts out of fixed sizing.

## Surface / Card foundation (`.card`)

The most-reused surfaces in studio are one ramp, and which class a surface takes is decided by what it sits ON:

| class               | fill                                                   | used by                                                                                                                                                     |
| ------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.card`             | `layout-*-inset` → `surface/inset`                     | content resting in the page; layout panels (`table-list`'s `card`/`panel` appearance); Modal and Dialog, which paint their own `bg-black/40` scrim          |
| `.card-overlay`     | `layout-*-deep-inset` → `surface/deep-inset`           | every popup: Dropdown, ContextMenu, Popover, Toast, Tooltip, TrackedTooltip, Tooltip3D, the Combobox/Select popup, NestedMenu, NestedCheckboxTree's submenu |
| `.card-transparent` | `layout-*-deep-inset` at 90% behind `backdrop-blur-xl` | a floating surface that has to keep what it covers legible                                                                                                  |

**None of them draws a border or an outline.** Separation is by fill and the shared two-layer shadow alone. `--card-border-color` still resolves per variant, but no class paints it, so a variant does not change how any of these surfaces looks — which is why the Figma `Card` is a single component rather than a variant set.

That separation does not meet WCAG 1.4.11's 3:1 for a component boundary, and the border it replaced did not either — 1.61:1 to 2.34:1 against the same grounds. `src/floating/surface-separation.browser.tsx` measures every pair in both themes and carries the figures. Closing the gap means moving the `layout-*` steps apart, which is a change to the ramp rather than to any one class.

Represented in Figma as a foundation:

- **`Card`** (`609:1342`) — a single base component, an empty themed surface: bg → `surface/inset`, `rounded-sm` (4px), shadow → the shared **`elevation/card`** effect style, no border. No Variant axis, because `.card` has no variant-dependent declaration. No Code Connect (it's a class, not a React component); guarded by `parity:figma`'s `checkCard` against the live `.card` rule, which fails if a border comes back on either side.
- **`elevation/card`** — a shared Figma **effect style** (`shadow-lg` = the two-layer drop shadow, offsets +10 and +4). Every card surface references it, so the elevation is defined once. This is the drift-killer: a single edit re-elevates every surface. Note both layers are offset DOWNWARD, so a surface's top edge gets no shadow at all.
- Every surface in the library references `elevation/card` for its shadow and carries **no border**. The composed examples sit on the step their code class does: `Menu`, `Dropdown` and `Select` on `surface/deep-inset` (they are `.card-overlay`); `Modal`, `Dialog` and `Panel` on `surface/inset` (they are `.card`). Modal and Dialog keep their header/footer hairlines, which are `surface/separator` fills rather than a border.
- **Panel** (`612:886`) — a layout-usage example (header + list rows in a `.card`), documenting the non-floating panel use.

Figma can't make the floating components literally _instance_ `Card` (instances don't accept slotted children), so standardization is enforced by the shared variables + shared effect style + the `checkCard` recipe guard rather than a composition refactor.

## Typography foundation (the type ramp)

`@semio/ui` has **no formal semantic ramp** — text sizing comes from `sized-text`
(the component `size` scale) plus ad-hoc Tailwind (`text-sm`/`text-xs` + weights),
all in the **system-sans stack** (`--font-sans: ui-sans-serif, system-ui, …` — no
brand font). Represented in Figma as a code-aligned set of **text styles** (the
typography analog of the `elevation/card` effect style), bound to the
`typography/font-family` variable:

| Style                                    | size / line-height | maps to                               |
| ---------------------------------------- | ------------------ | ------------------------------------- |
| `Text/2xs`                               | 9.6 / auto         | `size-xs` (`text-[0.6rem]`)           |
| `Text/xs`                                | 12 / 16            | `size-sm`, `text-xs`                  |
| `Text/sm` (+ `· Medium`)                 | 14 / 20            | `text-sm` (heavy ad-hoc use)          |
| `Text/base` (+ `· Medium`, `· Semibold`) | 16 / 24            | `size-md`, `text-base` (default/body) |
| `Text/xl`                                | 20 / 28            | `size-lg`, `text-xl`                  |
| `Text/2xl` (+ `· Semibold`)              | 24 / 32            | `size-xl`, `text-2xl` (headings)      |

- **Font = Inter**, the deliberate proxy for the code's system-sans stack (Figma
  can't render `system-ui`; Inter matches every component in the library). The
  `typography/font-family` variable was repointed **Montserrat → Inter**, and the
  five stray Montserrat `Type/*` styles (Display/Heading/Body/Label/Button — which
  matched neither the code nor the components) were **retired**.
- Line-heights mirror Tailwind defaults; weighted variants cover the real
  `font-medium`/`font-semibold` usage. Specimen on the Components page (`639:897`).
- Guarded by `parity:figma`'s `checkTypography` (every code size has a style;
  `sized-text` still maps the Tailwind utilities; font var = Inter).

## Button subset (worked example — what we actually build)

Grounded in a usage audit (56 `<Button>`, 38 files): inverted 61%, default-variant ~95%, sizes Md/Sm/Xs/fit only (Lg/Xl unused), leftIcon 80%.

- **visuals:** `default`, `inverted`, `inverted-border` (cta/list-item = single examples)
- **variant:** `default`, `primary`, `secondary`, `tertiary`, `error`
- **size:** `Md` primary, with `Sm`/`Xs`/`fit` as a scale (skip `Lg`/`Xl`)
- **states:** default/hover/focus/disabled via interactive toggle
- **icon:** left-icon slot (first-class) + right-icon slot; `deemphasize` dropped; custom `color` = one example
- **icon-only (square):** very common — `iconOnly = no children && exactly one icon` ([button.tsx:73](../src/buttons/button.tsx#L73)) → `sized-width` makes a square (Md 32×32) with the icon centered. In Figma it's a **`Show label` boolean** on the component: hiding the text node leaves icon + symmetric padding (8 + 16 + 8 = 32), collapsing to a perfect square. (Component properties can't drive sizing/padding, so the square falls out of symmetric padding, not a fixed dimension.)

- **Horizontal fill:** auto-layout **HUG** by default (fits content — the correct button default). The code is a grid whose label is the `1fr` column and whose icons are `auto` (`grid-cols-[auto_1fr_auto]` / `[auto_1fr]` / `[1fr_auto]`), so when a button is wider than its content the **icons pin to the left/right edges and the label fills + centers between them**. Mirrored in Figma by making the **label the FILL child** (center-aligned text) with the **icon slots HUG** — so a filled instance (Fill container, e.g. the Dialog's `flex-1` submit) pins the icons at the edges and centers the label, rather than centering the whole group inward. No change at hug width.

Reference artifacts in the Figma file: the `Button examples — visuals × states` board (Playground) and the `Icon Library` (🔣 Icons).

## TextField subset (worked example #2 — the inputs recipe)

Reuses the Button recipe almost verbatim (grounded in the usage audit: 21 `<TextField>`, 11 files; mostly `default`/`primary` variant, size Sm/Md, icon+clear common). Confirms the shared classes generalize.

- **Outline** (the `outline` prop, primary axis — maps onto Button's `visuals`): `interact` (default; `variant-responsive-appearing-outline` → **offset ring appears on hover/focus**, same recipe as Button solid focus), `always` (`variant-responsive-persistent-outline` → 1px border, 2px focus, like `inverted-border`), `hidden` (no ring).
- **Variant:** `default, primary, secondary, tertiary, error` (sets the accent color).
- **State:** `default, hover, focus, disabled` — modeled as an axis (60 variants = Outline×Variant×State, symmetric with Button) + interactivity.
- **Bindings:** interact ring stroke → `color/<variant>/bg-hover` (the accent, = variant-600); persistent border → `color/<variant>/bg`; placeholder + left-icon fill → **`color/content/muted`** (first consumer of the new surface/content token); typed-text → `color/content/fg`; font → `typography/font-family`. Radius 2 (`rounded-xs`), height 32 (md), 28×28 icon box at (2,2), 34px icon-side padding.
- **Properties:** `Placeholder` (TEXT), `Show icon` (BOOL) + `Icon left` (INSTANCE_SWAP over the `Icon/` library). The **clear button** (`onClear`) is modeled as **intrinsic to `State=focus`** (the X appears on focus, matching the code's `peer-focus:grid`), not a separate boolean.
- **Scoped out (examples/interactivity):** `size` (examples, not an axis — like Button), `bg`/`subtle`/custom `color` (single examples).
- **Horizontal fill:** the field is width-flexible (matching the code, where a TextField either fills its container or is constrained). The variant frame stays a resizable fixed-width box, but its children carry stretch-aware constraints — input/placeholder area `LEFT+RIGHT` (stretch), left-icon `LEFT`, clear button `RIGHT`, focus-ring `LEFT+RIGHT`. So an instance in an auto-layout parent set to **Fill container** stretches and reflows correctly (box + ring span, icon stays left, clear pins right); a fixed width (or Hug) gives the constrained case. (Was previously all-`MIN`/left-anchored → looked fixed-width and didn't reflow.)

Figma set `TextField` (node `496:628`, 🧩 Components) + `preview/textfield/interact/{primary,default}` frames (✨ Examples, Light+Dark cells) for the 1:1 Storybook `design` links. Code Connect: [textfield.figma.tsx](../src/inputs/textfield.figma.tsx). Parity: `textfield` block in `parity:figma` + `figma/textfield-contract.json`.

## Checkbox subset (worked example #3 — the first toggle)

The inputs cluster splits: **Search / Email / Password / NumberField are TextField _presets/compositions_** (Search = `<TextField icon=search onClear>`; Email/Password = `<Label>` + `<TextField>`), not new base components — represented as Example configurations of the TextField set + Label on the **"Input presets" board** (✨ Examples, node `517:941`): `preset/search|email|password|numberfield` frames built from configured TextField instances (+ label caption, eye icon, units). `figma-links.ts` `inputPreset` links these; only NumberField has stories today (wired), the others are Figma-side documentation. The genuinely-distinct primitives are **TextArea** (TextField recipe, multi-line) and the **toggles** (Checkbox, Switch, ToggleSquare). Checkbox is the first toggle built:

- **Variant** (8 — `default…info`, incl. status colors `success`/`warning`/`info`, which the Checkbox stories exercise unlike the action-only Button/TextField): sets the checked fill.
- **State:** `unchecked` (bg → **`color/surface/inset`**), `checked` (bg → `color/<variant>/bg`, hover→`bg-hover`), `disabled` (bg → `color/surface/base` @ node-opacity 0.5). Hover/focus (the shared `variant-responsive-appearing-outline` ring) via interactivity, not an axis.
- **Check glyph:** `Icon/selected`, fill bound to `color/<variant>/fg` (white in Light, black in Dark — matches `text-white dark:text-black`), visible in checked/disabled. Box is `sized-width/height` (32 md), radius 2.
- **Scoped out:** `size` (examples), `sizing`/`asIndicator` (list-item/inner contexts — single examples).

Figma set `Checkbox` (node `503:913`) + `preview/checkbox/<variant>` frames (Light+Dark). Code Connect: [checkbox.figma.tsx](../src/inputs/checkbox.figma.tsx) (Figma `State` axis → code `checked`+`disabled` booleans). Parity: `checkbox` block + `figma/checkbox-contract.json`.

### Switch & ToggleSquare (the rest of the toggle sub-cluster)

Both reuse `variant-checkbox-bg` (off → `color/surface/inset`, on → `color/<variant>/bg`) + the shared `appearing-outline` ring (interactivity). Built with 5 action variants × the component's states; stories were **authored fresh** (neither had one) and wired the Button way.

- **Switch** (`507:917`) — rounded track (`cornerRadius 12`) + white/black thumb (`color/default/fg`, flips per mode) that translates on `on`. States: off/on/disabled. [switch.figma.tsx](../src/inputs/switch.figma.tsx), `switch-contract.json`, new `switch.stories.tsx`.
- **ToggleSquare** (`508:997`) — Checkbox's square + tri-state: `partial` = inset colored border (`box-shadow` in code); on-state icon flips to `color/surface/inset` (= `neutral/200`↔`800`, matching `text-neutral-200 dark:text-neutral-800`). Icon is an `Icon` instance-swap slot (= `children`). States: off/on/partial/disabled. [togglesquare.figma.tsx](../src/inputs/togglesquare.figma.tsx), `togglesquare-contract.json`, new `toggle-square.stories.tsx`.

## Chip (Phase 2 — chips / badges / feedback)

A static badge (no interactive-state axis): a `color/<variant>/bg` filled pill with white label and optional icon/delete chips (`white/50` inner boxes). Built with the **8 variants** (chips use the status colors — stories cover Primary + Info) and component properties `Label` (TEXT) · `Show icon` (BOOL) + `Icon` (INSTANCE_SWAP) · `Show delete` (BOOL). No `State` axis — `variant-responsive-bg`'s hover shift is left to interactivity if added later.

Figma set `Chip` (node `523:1050`) + `preview/chip/{primary,info}` frames (Light+Dark). Code Connect: [chip.figma.tsx](../src/chip.figma.tsx) — `Show delete` maps to `onDelete`, `Show icon`/`Icon` to the `icon` slot. Parity: `chip` block + `figma/chip-contract.json`. Pill text is a literal white (code uses `text-white/75` in both modes — not the mode-flipping `fg` token).

### Progress & ProgressCircle (feedback)

Both are variant-tinted, no interactive-state axis; `progress` is a runtime number, so the Figma sets render a fixed **~60% demo** (not a property).

- **Progress** bar (`527:730`) — clipped rounded track container; a `track` rect bound to `color/<variant>/bg` at **node-opacity 0.5** (avoids the bound-paint-opacity reset) + an `indicator` rect at full opacity/60% width. `variant-static-bg-50` / `variant-static-bg`.
- **ProgressCircle** (`529:1093`) — a ring drawn with **`arcData` donut segments** (a fill-based approach; `dashPattern`+rotation fragmented and shifted the arc): full track ring @ 0.5 + a 60% arc from top, both `color/<variant>/bg`. Optional centered `Icon` instance-swap (`Show icon`).

Code Connect: both in [progress.figma.tsx](../src/feedback/progress.figma.tsx). Parity: `progress`/`progresscircle` blocks + `figma/progress-contract.json`, `figma/progresscircle-contract.json`. Stories `progress` + `progress-circle` wired (8 + 4 preview frames).

### StatusBadge, Spinner & KeybindingHint (feedback, closing Phase 2)

- **StatusBadge** (`544:722`) — the badge **dot**: an 8-variant set, dot bound to `color/<variant>/bg` with a 2px ring bound to **`color/surface/inset`** (= `ring-neutral-200 dark:ring-neutral-800`, exactly). The text/count mode and `placement` corners are contextual, shown as examples/story args, not axes. Code Connect [status-badge.figma.tsx](../src/feedback/status-badge.figma.tsx) (variant only; child is contextual), `status` parity block, `status-badge.stories.tsx` authored.
- **Spinner** (`545:706`) — a **static** representation of the animated ring (a ~30% blue-500 arc). No props/variants/tokens, so it gets a drop-in [spinner.figma.tsx](../src/feedback/spinner.figma.tsx) + `spinner.stories.tsx` but **no parity block** (nothing token-bound to assert; animation can't be mirrored).
- **KeybindingHint** — **not a mirrored component**: it renders adaptive inline text (⌘⇧⌥ on Mac, `Ctrl+Shift` on PC), no box/border. Represented as a Figma **example frame** ("KeybindingHint — examples") on the Components page; no Code Connect/parity (a text primitive, not a variant-bound visual).

## Menu / list items — nested-elements (Phase 3)

The `nested-elements/*` family (menu building blocks; stable — STUDIO-83 only supersedes `node-tree.tsx`, not these). Composed inside a Dropdown/ContextMenu (`NestedParent` context):

- **NestedItem** (`554:772`) — the menu row: 9 variants (`Variant{default,primary,error} × State{default,highlighted,disabled}`). Default = accent text (`color/<variant>/bg-hover`); **highlighted** = 50%-accent background (node-opacity) + `fg` text (the `data-highlighted` interaction); disabled dimmed. `Label` (TEXT) · `Show icon` + `Icon` (INSTANCE_SWAP → `left` slot) · `Show shortcut` (the `right` slot is arbitrary JSX, shown illustratively). rounded-xs, 28px (h-7).
- **NestedLabel** (`555:724`) — bold section header (`content/fg`), `Label` TEXT prop.
- **NestedSeparator** (`555:726`) — 1px accent divider (`variant-separator-fill`).
- **Menu (composed example)** (`556:724`) — the three assembled into a real popup (header + rows incl. a highlighted row + an error "Delete" + a separator), on a white surface with border + shadow. The `ui/Menu` story (Dropdown + `NestedExample`) links here.

**Sub-types** (same row chrome + a left selection indicator shown when selected; 2-state sets, `Label` prop):

- **NestedRadio** (`562:767`) — `radio-selected` dot when selected.
- **NestedCheckbox** (`562:782`) — `check` when checked (a single labeled item — clean Code Connect map).
- **NestedSelect** (`563:769`) — indicator swaps `point` (unselected) → `check` (selected).

`NestedRadio`/`NestedSelect` are options-array-driven groups in code (a Figma row = one option), so their Code Connect examples build a one-option group (illustrative). All exercised live in the `ui/Menu` story via `NestedExample`.

Code Connect: [nested-elements.figma.tsx](../src/nested-elements/nested-elements.figma.tsx) (all six). Parity: `nesteditem` + the three sub-type blocks + `figma/nested*-contract.json`.

## Floating containers — split by chrome-stability

The four floating containers split on one axis: **is the shell fixed and content-agnostic, or is it a dynamic arrangement of already-componentized rows?** The first kind earns a real component; the second stays a composition example. (Originally all four were examples under a blanket "compose in Figma" call — Modal/Dialog were promoted at publish time once it was clear their chrome is the reusable, drift-prone part.)

**Promoted to real component sets** (variant-bound, Code Connect + parity + contract):

- **Modal** (`600:1375`) — the standardized `.card` chrome: header (title + description + icon-only close **Button**) · hairline · body slot · hairline · footer (Cancel + Submit **Button** instances). Variant axis `default/primary/error` (representative; code also has secondary/tertiary/info/success/warning). Props: `Title`, `Show description`, `Show footer`, `Show cancel`. `.card` = `surface/inset` bg (= `layout-*-inset`) + `rounded-sm` (4px) + `shadow-lg`, **no border** — a modal is read against its own `bg-black/40` scrim rather than against the page, which is what carries its boundary; hairlines = `surface/separator`; title tints via `variant-static-text`; close + Submit are variant Buttons. [modal.figma.tsx](../src/floating/modal.figma.tsx), `ui/Modal` story linked (`figma-links` `modalComponent`).
- **Dialog** (`600:1495`) — the confirmation chrome: header + optional body + full-width split footer, sharing Modal's `.card` language with distinct `AlertDialog` semantics. Same variant axis (`error` = destructive-confirm). Props: `Title`, `Show description`, `Show cancel`. [dialog.figma.tsx](../src/floating/dialog.figma.tsx), `ui/Dialog` story linked (`dialogComponent`). A composed **usage example** sits alongside each (the `— usage example (composed)` sections).

The Dropdown/Select **example panels** use the same `.card` recipe (`surface/inset` + 2px `surface/separator` border + `rounded-sm`), so they render correctly in dark mode too — they were retrofitted from an earlier hardcoded-white panel.

**Kept as composition example frames** (no Code Connect/parity — arrangements of existing components over a dynamic, data-driven list):

- **Dropdown** (`569:1162`) — a Button trigger + a menu popup built from **NestedItem** rows. A component here would be an empty panel with a swap slot; the rows are the components.
- **Select** (`569:1214`) — an input-like trigger (`surface/inset`, value + ▾) + an open list of **NestedRadio** options + `Chip`s. Trigger + Dropdown + rows, all already mirrored.

Dropdown/Select stories wired via `figma-links` `floatingExample`. (Dropdown ≈ the `Menu` composed example; Select reuses the nested-select rows.)

## Tabs (layout primitive)

`Tabs` (`578:841`) — a tab row: a `surface/deep-inset` container with the active-tab **indicator** = `color/<variant>/bg` @ 25% (node-opacity) + a 1px `variant/bg` border, inactive tabs muted (`content/muted`). 5-variant set (active-tab color), labels visuals; icon/`both` visuals + size are examples. Code Connect [tabs.figma.tsx](../src/layouts/tabs.figma.tsx) (data-driven `children`, so an illustrative example), `tabs` parity block + `figma/tabs-contract.json`, `ui/Tabs` story linked.

### Modal variants (SidebarModal / TabbedModal) — composed in Figma, not mirrored

Both are **compositions of the base `Modal`**, not new chrome: TabbedModal = Modal + this Tabs row; SidebarModal = a Modal shell + a collapsible sidebar-nav + content pane (heavily behavioral). Low-usage. Decision: they're **rebuilt in Figma** from the base Modal + the relevant primitives (the same way code composes them) rather than mirrored as dedicated components — mirroring every modal assembly grows a combinatorial, drift-prone library. Adding the reusable **Tabs** primitive (above) is what makes a tabbed modal easy to compose.

## Coverage top-ups (high-usage gaps)

Filled from a usage re-audit — commonly used in studio but previously unmirrored:

- **Tooltip** (`584:829`) — the `.card-overlay` popover with `variant-static-text` (variant-colored) label + a downward caret. Body + caret are **one silhouette vector** (a rounded-rect body with a caret notch in its bottom edge), filled with the inset color and **unstroked** — not a separate box, and not outlined. This mirrors the code `Arrow`, whose path is filled to match the surface it hangs off and carries no stroke; the vector being one shape is what keeps the caret's fill continuous with the body's. Shadow via the shared `elevation/card`. 5-variant set. [tooltip.figma.tsx](../src/floating/tooltip.figma.tsx), `ui/Tooltip` story linked.
- **SliderNumberField** (`585:833`) — a field with the `variant-input-gradient-bg` slider fill (`color/<variant>/bg` to ~60% + faded after) + label + value. 5-variant set. [slidernumberfield.figma.tsx](../src/inputs/slidernumberfield.figma.tsx), `ui/SliderNumberField` story linked. **Horizontal fill** (same treatment as TextField): faded track `LEFT+RIGHT` (stretch), value fill `SCALE` (keeps ~60% proportionally), label `LEFT`, value `RIGHT` — so a filled instance spans and reflows.

**Input-family fill status** (verified filling to a 472px container): TextField and SliderNumberField were retrofitted (see above); **Label** and the **Select trigger** were already fill-capable (auto-layout with a FILL text child + trailing item pinned/hugged); the input-preset example frames inherit the fix through their TextField instances. Checkbox/Switch/ToggleSquare/Chip are intentionally fixed/hug (not width-filling). All Figma-file-only — needs a library re-publish to reach consumers.

- **Label** (`583:812`) — the form-field label (label text `content/muted` + optional error `Message`). Single component, `Label`/`Show message`/`Message` props — the primitive the Email/Password presets inline. [label.figma.tsx](../src/inputs/label.figma.tsx).
- **NestedMenu** (`586:833`) — the submenu trigger row (NestedItem chrome + right chevron), states default/highlighted — completes the menu family. In [nested-elements.figma.tsx](../src/nested-elements/nested-elements.figma.tsx).

All in `parity:figma` (`tooltip`/`slidernumberfield`/`label`/`nestedmenu` blocks + contracts). Not built (deliberately): ScrollArea (structural), HeaderButton/Anchor (Button variants), color pickers / Autocomplete / Combobox (niche).

## Layout convention (both pages)

Every component set / example lives in a titled Figma **Section** ("panel") with a uniform light `#f7f7f7` background, laid out in a non-overlapping vertical stack (Components page) or grouped preview grids (Examples page). Component-set frames are transparent so the section is the single backdrop.

## Icon color (the `currentColor` problem)

Code icons inherit `currentColor` (the context's text color); Figma has no equivalent. Two cases:

- **In a component** (Button, etc.): the component overrides the icon-slot fill to its own foreground (`color/<variant>/fg`) per-instance — the contextual analog.
- **Standalone** (dropped directly): needs a neutral default. The `Color` collection had only variant button-foregrounds (`color/<variant>/fg` ≈ white), so we added **`color/content/fg`** (Light→`neutral/900`, Dark→`neutral/100`) and bound every `Icon/` component's fills **and** strokes to it (Tabler = stroke, semio = fill). Do **not** bind icons to `color/default/fg` — it's white and renders invisible on light surfaces.

## The skills (distributed via a plugin, not this repo)

The `figma-component-fidelity` (build a faithful Figma component) and `semio-ui-mockup` (reuse-first mockups + library-gap hook) skills used to live in `.claude/skills/` here; they now ship from the private **`semio-ai/claude-plugins`** marketplace as the `semio-design-system` plugin (`/plugin marketplace add semio-ai/claude-plugins` → `/plugin install semio-design-system@semio`). They still target this repo — their paths/commands are relative to a `semio_studio` checkout. Edit them in that repo, not here.

## Figma gotchas (carried in the skill)

`clipsContent` clips offset rings / OUTSIDE strokes (unclip the frame + hugging containers) · paint-opacity resets on variable-bound fills (use node opacity) · pin the Brand mode or tokens resolve inconsistently · enumerate the full prop space (don't bake one visual) · SECTION children are section-relative (verify `absoluteBoundingBox`) · `vectorPaths` rejects SVG arc `A` (use cubic bézier).

## Applying to the next component

Re-run the usage audit (`~/Projects/semio-button-usage-audit.mjs`, generalizes) for that component to find its real subset — selects/inputs share these classes but have different biases (e.g. inputs lean on `variant-responsive-appearing-outline` for focus). Then build with the recipe above + the skill.
