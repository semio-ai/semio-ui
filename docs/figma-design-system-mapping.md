# @semio/ui → Figma mapping (shared patterns)

The point of this doc: the styling in `@semio/ui` lives in **shared classes** (`packages/ui/public/styles.css`), not per-component, so the same handful of patterns drive Button, inputs, selects, chips, etc. Mapping those classes to Figma **once** — learned from the Button — means every other component reuses the same recipe. Pair with the `figma-component-fidelity` skill (the build process + Figma gotchas) and the `parity:figma` check (the gate).

Token resolution is brand-driven: a `variant` class sets `--standard-color` / `--accent-color` CSS vars, which resolve through the `Brand` collection (Default/Semio) → `Color` semantic vars → primitives. In Figma, bind to the **semantic** vars (`color/<variant>/bg`, `bg-hover`, `fg`); the active Brand mode picks the hue (blue under Default, orange under Semio).

## Visual treatments (the `visuals` axis)

| Code (`visuals`) | Shared classes | Meaning | Figma representation |
|---|---|---|---|
| `default` (solid) | `variant-responsive-bg` + `variant-responsive-appearing-outline` + white text | filled bg; **offset focus ring** | fill → `color/<variant>/bg`; hover → `bg-hover`; **focus ring = discrete offset rect** (2px gap, stroke `bg-hover`, 1px hover / 2px focus); text/icon → `fg` |
| `inverted` (text) | `variant-responsive-text` + `outline-hidden` | colored text, transparent, **no ring** | no fill; text/icon → `color/<variant>/bg`; **no focus ring** |
| `inverted-border` (bordered) | `variant-responsive-text` + `variant-responsive-persistent-outline` | colored text + **always-on border** | no fill; text/icon → `color/<variant>/bg`; persistent border stroke → `color/<variant>/bg` (1px, focus 2px) |
| `call-to-action` | `cta-button` | special/gradient | one documented example (edge case) |
| `list-item` | inherits parent | — | one documented example (edge case) |

Key shared pattern: **the offset focus ring (`appearing-outline`, `outline-offset-2`) belongs to *solid* controls**; text variants suppress it (`outline-hidden`); bordered uses a *persistent* outline. Inputs/selects that use `variant-responsive-appearing-outline` get the **same offset-ring recipe** — reuse it, don't reinvent.

## States

| State | Code | Figma |
|---|---|---|
| Default | base | base |
| Hover | solid: bg→`--accent-color`; text/bordered: (per visual) | solid: fill→`bg-hover` (+ ring); inverted: none; bordered: border |
| Focus | `appearing-outline` → `outline-2` (solid); persistent → 2px (bordered) | offset ring 2px (solid); border 2px (bordered); none (inverted) |
| Disabled | bg/outline → `color-mix(… 50%, transparent)` | **node opacity ≈ 0.45** (paint-level opacity is reset to 1 on bound fills — see skill) |

Model states with an **interactive component** (toggle), not a state variant axis, to avoid combinatorial blow-up.

## Variant & size

- **variant** (`primary`/`secondary`/`tertiary`/`default`/`error`/…): selects the `color/<variant>/*` token set. In Figma a variant **must be predefined** to be usable (no on-demand like the code prop) — define the ones you need.
- **size** (`size-xs|sm|md|lg|xl` + `sized-text`/`sized-height`/`sized-width`): dimension tokens. `fit` opts out of fixed sizing.

## Button subset (worked example — what we actually build)

Grounded in a usage audit (56 `<Button>`, 38 files): inverted 61%, default-variant ~95%, sizes Md/Sm/Xs/fit only (Lg/Xl unused), leftIcon 80%.

- **visuals:** `default`, `inverted`, `inverted-border` (cta/list-item = single examples)
- **variant:** `default`, `primary`, `secondary`, `tertiary`, `error`
- **size:** `Md` primary, with `Sm`/`Xs`/`fit` as a scale (skip `Lg`/`Xl`)
- **states:** default/hover/focus/disabled via interactive toggle
- **icon:** left-icon slot (first-class) + right-icon slot; `deemphasize` dropped; custom `color` = one example
- **icon-only (square):** very common — `iconOnly = no children && exactly one icon` ([button.tsx:73](../src/buttons/button.tsx#L73)) → `sized-width` makes a square (Md 32×32) with the icon centered. In Figma it's a **`Show label` boolean** on the component: hiding the text node leaves icon + symmetric padding (8 + 16 + 8 = 32), collapsing to a perfect square. (Component properties can't drive sizing/padding, so the square falls out of symmetric padding, not a fixed dimension.)

Reference artifacts in the Figma file: the `Button examples — visuals × states` board (Playground) and the `Icon Library` (🔣 Icons).

## TextField subset (worked example #2 — the inputs recipe)

Reuses the Button recipe almost verbatim (grounded in the usage audit: 21 `<TextField>`, 11 files; mostly `default`/`primary` variant, size Sm/Md, icon+clear common). Confirms the shared classes generalize.

- **Outline** (the `outline` prop, primary axis — maps onto Button's `visuals`): `interact` (default; `variant-responsive-appearing-outline` → **offset ring appears on hover/focus**, same recipe as Button solid focus), `always` (`variant-responsive-persistent-outline` → 1px border, 2px focus, like `inverted-border`), `hidden` (no ring).
- **Variant:** `default, primary, secondary, tertiary, error` (sets the accent color).
- **State:** `default, hover, focus, disabled` — modeled as an axis (60 variants = Outline×Variant×State, symmetric with Button) + interactivity.
- **Bindings:** interact ring stroke → `color/<variant>/bg-hover` (the accent, = variant-600); persistent border → `color/<variant>/bg`; placeholder + left-icon fill → **`color/content/muted`** (first consumer of the new surface/content token); typed-text → `color/content/fg`; font → `typography/font-family`. Radius 2 (`rounded-xs`), height 32 (md), 28×28 icon box at (2,2), 34px icon-side padding.
- **Properties:** `Placeholder` (TEXT), `Show icon` (BOOL) + `Icon left` (INSTANCE_SWAP over the `Icon/` library). The **clear button** (`onClear`) is modeled as **intrinsic to `State=focus`** (the X appears on focus, matching the code's `peer-focus:grid`), not a separate boolean.
- **Scoped out (examples/interactivity):** `size` (examples, not an axis — like Button), `bg`/`subtle`/custom `color` (single examples).

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

## Icon color (the `currentColor` problem)
Code icons inherit `currentColor` (the context's text color); Figma has no equivalent. Two cases:
- **In a component** (Button, etc.): the component overrides the icon-slot fill to its own foreground (`color/<variant>/fg`) per-instance — the contextual analog.
- **Standalone** (dropped directly): needs a neutral default. The `Color` collection had only variant button-foregrounds (`color/<variant>/fg` ≈ white), so we added **`color/content/fg`** (Light→`neutral/900`, Dark→`neutral/100`) and bound every `Icon/` component's fills **and** strokes to it (Tabler = stroke, semio = fill). Do **not** bind icons to `color/default/fg` — it's white and renders invisible on light surfaces.

## Figma gotchas (carried in the skill)
`clipsContent` clips offset rings / OUTSIDE strokes (unclip the frame + hugging containers) · paint-opacity resets on variable-bound fills (use node opacity) · pin the Brand mode or tokens resolve inconsistently · enumerate the full prop space (don't bake one visual).

## Applying to the next component
Re-run the usage audit (`~/Projects/semio-button-usage-audit.mjs`, generalizes) for that component to find its real subset — selects/inputs share these classes but have different biases (e.g. inputs lean on `variant-responsive-appearing-outline` for focus). Then build with the recipe above + the skill.
