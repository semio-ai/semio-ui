# Icon ↔ Figma Integration Plan

How we connect the code icon registry to the Figma "Semio UI Library", structured so:

- it delivers value **on the current Professional plan**,
- it's a **drop-in upgrade** if/when we move to Organization/Enterprise (Code Connect) — nothing built now is wasted,
- it **scales to a multi-person team** without drift.

For the plan/tier decision this depends on, see **[figma-code-connect-evaluation.md](figma-code-connect-evaluation.md)**.

## Guiding principle: code is the source of truth; Figma derives from it

The default registry in `@semio/ui` is the single source of truth for *which icons exist* and *what they're named*. Ui's icons on the Figma side are **generated from** or **named after** that registry. Code Connect, when available, is an **additive final layer** on top — not a prerequisite for anything earlier.

This ordering is what makes the work plan-agnostic: phases 1–2 are pure "make Figma match the code," valuable on any plan; phase 3 only switches on the automation once the tier allows it.

```
Phase 0  code registry
   └─ Phase 1  generate: key manifest + SVG assets  (any plan, now)
        └─ Phase 2  build Figma library from those assets  (any plan, design work)
             └─ Phase 3  Code Connect  (Organization/Enterprise only — additive)
```

## Phase 0 — Code foundation

- `<Icon name>` + `IconProvider` + ui's default registry, one source per built-in key — counted by `count` in [`figma/icon-manifest.json`](../figma/icon-manifest.json).
- Build-time key checking (`IconName` + augmentable `IconRegistryKeys`).
- Runtime resolution tests over ui's default registry. Consumer registries extend it through `IconProvider` and `IconRegistryKeys` augmentation.

This is the contract everything else derives from.

## Phase 1 — Generate the bridge artifacts (any plan)

Two regenerated-from-code artifacts make the Figma side mechanical and keep it honest:

1. **Key manifest** — the committed list of every ui key (`source: "default"`), emitted from ui's default registry. This is the checklist for the Figma library and the input to Code Connect later.
2. **SVG asset set named by key** — one `*.svg` per key (e.g. `save.svg`, `close.svg`), exported from the same components the registry resolves. Designers **import these into Figma** and name each component `Icon/<key>`. The SVG assets are gitignored because they are bulky and regenerable.

Mechanics:

- `npm run generate:icons` generates `glyph.generated.ts` and the curated Tabler map; Solar and roles supply the other built-in keys.
- `npm run generate:icon-svgs` renders ui's default registry into `figma/icon-manifest.json`, `figma/icon-svgs.generated.json` and individual `figma/icon-svgs/<key>.svg` files. Neither generator requires a sibling checkout or a prior build.
- The naming contract (already in [icon-registry.md](icon-registry.md)) governs the file names: **file stem == registry key == Figma component name after stripping `Icon/`**.

Why this matters for scale: adding an icon becomes one flow — *register in code → regenerate → re-import/sync in Figma* — instead of hand-drawing and hand-naming in two places.

## Phase 2 — Build the Figma library (any plan, design work)

- Import the Phase 1 SVGs into the "Semio UI Library" file; each becomes a component **named by key** (the import naming carries over).
- Give icon-bearing components (Button `leftIcon`/`rightIcon`, menu/select/input `icon` slots) an **instance-swap** property pointing at the icon set. This is the "pick an icon" dropdown and works on **any plan**.
- Ui components in the shared library are named `Icon/<key>` and sorted by key. Each is a 24×24 component whose solid paints are bound to `color/content/fg`; a duotone glyph's secondary shape keeps the SVG's 60% opacity. Consumers maintain their own domain registries and mappings in the same Figma library. The ui manifest's `count` field records ui's set size; restating it here would go stale with each key added.
- Import a glyph with `createNodeFromSvg` → `createComponentFromNode`, then bind each solid paint to `color/content/fg`. Re-apply a paint's `stroke-opacity`/`fill-opacity` after binding, because assigning a bound paint resets its opacity to 1. Bake anything the app applies in CSS into the SVG first — a root `transform: rotate(…)` style, or the `icon-duotone-inverted` opacity swap — because Figma has no stylesheet and would import the un-transformed glyph.

Multi-person notes:
- Publish the library so everyone consumes one source.
- On Organization, do this on a **library branch** and review before publishing; on Professional, coordinate edits manually (a real reason the upgrade helps at team scale).

Via the Figma MCP server's write-to-canvas capability, an agent can generate components named by key directly from the registry's SVGs on the **Professional plan**. The components appear in Assets and support instances and instance-swap, so designers can reuse them like manually created components. Organization/layout and design polish still need review. Keep `figma.config.json` pointed at the shared library destination.

## Phase 3 — Code Connect (Organization/Enterprise only; additive)

Switches on **only** when the plan allows. Layers on top of Phases 1–2 with no rework:

- `@figma/code-connect` and `figma.config.json` configure the local mappings; `npm run connect:parse` validates them offline.
- Generate one `figma.connect()` mapping per icon from the registry + a **key → Figma nodeId manifest** (the nodeIds exist once Phase 2 publishes the components). The mapping emits `<Icon name="…" />` for each.
- Apply generated mappings in bulk rather than hand-writing one file per key. Publishing requires access to the configured library.
- A Code Connect sync check can catch mappings that reference a nonexistent registry key; local parsing alone does not compare against live Figma.

Because this is isolated to its own config + generated files, **flipping plans later = run the generator + apply mappings.** Nothing in Phases 0–2 changes.

## Why the mapping matters

Reading a design without Code Connect yields a generic reconstruction rather than ui's API: an icon can be returned as an `<img>`, and a Button as a styled frame with artwork and text. Figma *variables* surface in the readout; component *identity* needs the naming contract or Code Connect. Aligning the variables with code tokens preserves styling, while the mapping recovers `<Icon name="box" />` and `<Button variant="primary" leftIcon="save">`.

## Easing design→code without Code Connect (the code-side lever)

Code Connect (Org-only) is the single weak link, but its job — mapping a Figma component to our real code API — can be held on **our** side and applied by our agent, on Professional:

- **The naming convention is the mapping.** `get_design_context` returns component/variant names and variables (`data-name="box"`, `Variant=…`, `--color-primary`). Because Figma components are named by registry key and Button variants mirror our props, translating `Icon/box` → `<Icon name="box" />` and a Button frame → `<Button variant="primary" …>` is deterministic.
- **Agent-side translation = poor-man's Code Connect.** The same MCP client that writes the library can read a design and emit real components — no upgrade.
- **Make it durable** with a small repo-side mapping manifest (Figma name/variant → code component + prop rules) or a Figma Skill (markdown) the agent follows. This is Code Connect's logic, stored on our side. The committed [`figma/icon-manifest.json`](../figma/icon-manifest.json) provides this table (one entry per ui key, regenerated by `npm run generate:icon-svgs`), alongside the translation rules in [icon-figma-handoff.md](icon-figma-handoff.md).
- **Tokens partly free:** variables already surface in the readout; aligning Figma variable names to our CSS token names tightens fidelity.

**Tradeoff vs. real Code Connect:** the remainder is native Dev-Mode snippets for devs who don't use our agent, plus Figma-hosted enforcement/analytics. For an agent-driven team this covers most of the value on Pro.

## Keeping it in sync (multi-person, anti-drift)

The manifest is the checklist for comparing ui keys with the shared library's `Icon/*` components. A comparison with live Figma catches missing or extra components; the local `npm run parity:figma` check compares a fresh ui manifest with the committed one and checks ui component snapshots without reading live Figma. Registry tests enforce unique ownership and glyph contracts.

Three guardrails, escalating with plan:

| Guard | Catches | Available |
|---|---|---|
| Resolution test (code) | A key with no real glyph | now |
| Key manifest comparison with live Figma | Code has a key the Figma library is missing (or vice-versa) | manifest + library access |
| Code Connect CI | A Figma component pointing at a non-existent code key | Phase 3 (org) |

**"How to add an icon" (the one documented flow):**
1. Register generic glyphs in ui's default registry. Consumers own their domain keys, registry exports, key augmentation and Figma mappings.
2. Run `npm run generate:icons` and `npm run generate:icon-svgs` → manifest + SVG update.
3. Import/sync the new SVG into the Figma library as a keyed component.
4. Run `npm run parity:figma` to check local staleness. Where Code Connect is available, generate and publish the matching icon mapping.
