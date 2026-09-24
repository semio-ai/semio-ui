# Figma component port — prioritized, sized plan (STUDIO-65)

Sequencing plan for porting the rest of `@semio/ui` into the **Semio UI Library** Figma
file, following the method proven by the Button PoC. **Audit-driven** — priorities below
come from a real usage count across `apps/` + `packages/` (excluding `@semio/ui` itself,
Storybook, and tests), not a guess. Re-runnable: `scratchpad/ui-usage-audit.mjs`.

Pairs with [`figma-design-system-mapping.md`](./figma-design-system-mapping.md) (class → Figma recipe),
the `figma-component-fidelity` skill (build process + gotchas), and `parity:figma` (the gate).

## What's already done (the template + rails)

- **Icon library** — 341 `Icon/<key>` components on the 🔣 Icons page: one per composed-registry key (332) plus 9 retired keys that have no registry entry and stay until STUDIO-295 removes them; `color/content/fg` token; Code Connect ([icon.figma.tsx](../src/icons/registry/icon.figma.tsx)). *(STUDIO-11, done.)*
- **Button** — the faithful template: `Visual × Variant × State`, icon slots, interactive states, [button.figma.tsx](../src/buttons/button.figma.tsx), Layer-1 parity + `figma/button-contract.json` snapshot.
- **Rails, reusable as-is per component:** the fidelity skill, the shared class→Figma recipe, `figma.config.json` + `npx figma connect parse` (validated on Pro), the Storybook design-link harness, and the two-layer parity check.

## Audit results (usage across consumers)

| Cluster | Top components (usages) | Recipe reuse from Button | Fidelity risk |
|---|---|---|---|
| **Inputs** | TextField 21 · SliderNumberField 13 · NumberField 12 · ToggleSquare 12 · Label 11 · NumberOrList 9 · Search 7 · TimeInput 6 · Checkbox 5 · (Switch/ToggleGroup/Password/Email/TextArea/Autocomplete/ColorPicker/ImageInput 1 each) | **High** — same `Variant`/`Size`, `outline: hidden\|interact\|always` = the appearing-outline focus recipe, same `IconValue` icon slot | Low |
| **Menus / list items** (`nested-elements`) | NestedItem 57 · NestedLabel 42 · NestedSeparator 26 · NestedRadio 17 · NestedMenu/Select 3 · MenuItem · SelectList 1 · TableList 8 | Medium — variant/size tokens, but row layout is new | Medium (composed, behavioral) |
| **Floating containers** | Dropdown 19 · Select 15 · Modal 11 · Dialog 7 · TabbedModal 2 · Popover/SelectTree/Toast 1 | Low — overlay composition, not token-bound primitives | Med-High |
| **Chips / badges / feedback** | KeybindingHint 21 · ToggleSquare (see inputs) · KeyIcon 7 · Progress 5 · StatusBadge 3 · Chip · Snippet 3 · Spinner/Avatar 1 | **High** — Chip reuses `variant-responsive-bg/text` + `Size`/`Variant` + icon slot; Status/Progress are small variant-bound primitives | Low |
| **Layout** (structural) | ScrollArea 19 · Accordion 5 · Breadcrumbs/Collapse/Resizer/Separator 1 | N/A — frames/behavior, minimal token surface | — (examples-only) |

**Headline findings**
1. **Inputs share Button's recipe almost verbatim** — the documented next step is also the lowest-risk, fastest-fidelity win. TextField is the anchor; Search/Password/Email/NumberField/TextArea are variations on one base.
2. **`nested-elements` is the single highest-usage cluster** (NestedItem+Label+Separator+Radio ≈ 142 usages) and is **stable** — [STUDIO-83](https://linear.app/semio-ai/issue/STUDIO-83) supersedes only `node-tree.tsx` (and refactors *animation*'s track-list + the *live-data* table into new `@semio/ui/tree/*` primitives); it does **not** touch the `nested-elements/*` menu family. So Phase 3 mirrors nested-elements freely; only `node-tree.tsx` is off-limits (skip it — it's being removed).
3. **Chips/badges/feedback are small, self-contained, high-reuse** — a whole cluster can be completed quickly for an at-a-glance parity win.
4. **Floating containers are high-usage but low token-fidelity value** — model as composition examples, not variant-bound components.

## Foundational step (STUDIO-70 #1) — DONE, with a correction

**The Light/Dark theme collection already existed.** File inspection showed the `Color`
collection already has **Light/Dark modes** and 25 semantic vars (`color/<family>/{bg,bg-hover,fg}`
for primary/secondary/tertiary/success/warning/error/info/default + `color/content/fg`), aliasing
through `Brand` (Default/Semio) → `Primitives`. The Button already binds to it. So STUDIO-70 #1's
literal "create a Theme collection with Light/Dark" was **already satisfied** — a new collection
would only duplicate `Color`.

**The real gap was neutral surface/content tokens** (the existing set is button-centric variant
fills; Light≈Dark except the `fg` flip). Added to the `Color` collection (semantic `color/surface/*`
names, one mode-switched var per CSS light/dark pair from `theme.css`), verified by swatch render
in both modes:

| Token | Light | Dark | Scopes |
|---|---|---|---|
| `color/surface/base` | `#cccccc` | `#333333` | frame/shape fill |
| `color/surface/inset` | `neutral/200` | `neutral/800` | frame/shape fill |
| `color/surface/deep-inset` | `#ededed` | `neutral/900` | frame/shape fill |
| `color/surface/separator` | `neutral/400` | `neutral/950` | frame/shape fill + stroke |
| `color/content/muted` | `neutral/600` | `neutral/400` | text fill |

No rebinding of Button/icons needed (they don't use surfaces). **Publish** (Assets → Publish, a
Figma-UI user action) is only needed to expose these to *downstream consumer files*; component
building in this same file uses them immediately.

## Phasing (recommended order)

| Phase | Scope | Est. size | Rationale |
|---|---|---|---|
| **0** | ✅ Surface/content tokens added to `Color` (theme collection already existed) | done | Foundational; unblocks no-variant-explosion theming |
| **1** | **Inputs** — ✅ **TextField** built (60-variant Outline×Variant×State set, node `496:628`, Code Connect + parity + Storybook links, first `content/muted` consumer). Next: Search/Password/Email/NumberField/TextArea share TextField's base; then Checkbox/Switch/ToggleSquare/ToggleGroup as toggles | TextField done; rest 1–2 sessions | Highest recipe reuse, lowest risk, documented next step |
| **1b** | **Toggles** — ✅ **Checkbox** (`503:913`), ✅ **Switch** (`507:917`), ✅ **ToggleSquare** (`508:997`) all built with Code Connect + parity + Storybook links (Switch/ToggleSquare stories authored fresh). **Presets** (Search/Email/Password/NumberField) → Example configs of TextField+Label, not new sets. | ✅ done | Distinct toggle shapes; presets need no new component |
| **2** | **Chips / badges / feedback** — ✅ **Chip** (`523:1050`), **Progress** (`527:730`), **ProgressCircle** (`529:1093`), **StatusBadge** (`544:722`), **Spinner** (`545:706`, static) built with Code Connect + Storybook links (+ parity for the token-bound ones); **KeybindingHint** represented as an example frame (text primitive). **Phase 2 complete.** | ✅ done | Small, self-contained, completes a full cluster |
| **3** | **Menus / list items** (`nested-elements`) — ✅ **NestedItem** (`554:772`), **NestedLabel** (`555:724`), **NestedSeparator** (`555:726`) + composed **Menu** example (`556:724`) built with Code Connect + parity + `ui/Menu` story link. + sub-types ✅ **NestedRadio** (`562:767`), **NestedCheckbox** (`562:782`), **NestedSelect** (`563:769`). **Phase 3 complete.** | ✅ done | Highest usage; stable (STUDIO-83 only supersedes `node-tree.tsx`) |
| **4** | **Floating containers** — ✅ **Modal** (`567:1146`), **Dialog** (`568:1154`), **Dropdown** (`569:1162`), **Select** (`569:1214`) built as composition example frames + wired the existing stories' design links. **Phase 4 complete.** | ✅ done | High usage, low token value; examples not full variants |
| — | Layout (ScrollArea/Accordion/…) | out of scope | Structural; no meaningful Figma-component surface |

Each phase per component: usage audit (done here) → build faithful Figma component (skill) →
author `<Component>.figma.tsx` → extend `parity:figma` SUBSET + capture snapshot → screenshot-verify vs Storybook.

## Cleanup (this pass)

- ✅ Stray root PNGs removed (`assets-cards.png`, `atp2.png`, `publish6.png`).
- ✅ Pruned 5 merged/clean worktrees (`ci-node-pin`, `sem144`, `studio18/19/20`); kept `studio23` (active), `studio30` (unmerged), `studio83` (uncommitted changes).
- ✅ **STUDIO-69** — **already fixed** in the live file: the solid `State=focus` ring rects already carry `{STRETCH, STRETCH}` constraints; an icon-only focus instance renders a correct 32×32 square with a 36×36 hugging ring (verified). No edit/re-publish needed — recommend closing the ticket.
- ✅ **STUDIO-70 #1** theme tokens — surface/content tokens added to `Color` (see Foundational step). The Storybook theme-sync / Code-Connect items (#2–#5) remain open under STUDIO-70.

## Open decisions
- STUDIO-83 coordination: does the `nested-elements` Figma port wait on the shared row-list primitive refactor?
- Whether/when to **publish** the library so the new surface tokens reach downstream consumer files (a Figma-UI action).
