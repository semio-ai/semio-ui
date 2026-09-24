# Icon ↔ Figma Integration Plan (SEM-167)

How we connect the code icon registry to the Figma "Semio UI Library", structured so:

- it delivers value **on the current Professional plan**,
- it's a **drop-in upgrade** if/when we move to Organization/Enterprise (Code Connect) — nothing built now is wasted,
- it **scales to a multi-person team** without drift.

For the plan/tier decision this depends on, see **[figma-code-connect-evaluation.md](figma-code-connect-evaluation.md)**.

## Guiding principle: code is the source of truth; Figma derives from it

The registry in `@semio/ui` (+ `@semio/animation`, `apps/studio`) is the single source of truth for *which icons exist* and *what they're named*. Everything on the Figma side is **generated from** or **named after** that registry. Code Connect, when available, is an **additive final layer** on top — not a prerequisite for anything earlier.

This ordering is what makes the work plan-agnostic: phases 1–2 are pure "make Figma match the code," valuable on any plan; phase 3 only switches on the automation once the tier allows it.

```
Phase 0  code registry (DONE)
   └─ Phase 1  generate: key manifest + SVG assets  (any plan, now)
        └─ Phase 2  build Figma library from those assets  (any plan, design work)
             └─ Phase 3  Code Connect  (Organization/Enterprise only — additive)
```

## Phase 0 — Code foundation (done)

- `<Icon name>` + `IconProvider` + composed registry (default ⊕ animation ⊕ studio), **332 unique keys**.
- Build-time key checking (`IconName` + augmentable `IconRegistryKeys`).
- Runtime resolution test over the composed registry.

This is the contract everything else derives from.

## Phase 1 — Generate the bridge artifacts (any plan, do now)

Two committed, regenerated-from-code artifacts that make the Figma side mechanical and keep it honest:

1. **Key manifest** — the canonical list of all 332 composed keys (with source: tabler / semio / role / animation / studio), emitted by a script. This is the checklist for the Figma library and the input to Code Connect later.
2. **SVG asset set named by key** — one `*.svg` per key (e.g. `trash.svg`, `close.svg`), exported from the same components the registry resolves. Designers **import these into Figma** and each becomes a component already named correctly.

Mechanics:

- Extend the existing `scripts/generate-icon-registry.mjs` (or a sibling script) to also emit the manifest + SVGs. Wire it to an `npm run` task next to `generate:icons`.
- The naming contract (already in [icon-registry.md](icon-registry.md)) governs the file names: **file name == registry key == future Figma component name**.

Why this matters for scale: adding an icon becomes one flow — *register in code → regenerate → re-import/sync in Figma* — instead of hand-drawing and hand-naming in two places.

## Phase 2 — Build the Figma library (any plan, design work)

- Import the Phase 1 SVGs into the "Semio UI Library" file; each becomes a component **named by key** (the import naming carries over).
- Give icon-bearing components (Button `leftIcon`/`rightIcon`, menu/select/input `icon` slots) an **instance-swap** property pointing at the icon set. This is the "pick an icon" dropdown and works on **any plan**.
- The file's 🔣 Icons page holds 341 `Icon/<key>` components — one per composed-registry key (332) plus 9 retired keys with no registry entry, which stay until STUDIO-295 removes them — in three grids by owning package (default / animation / studio) sorted by key. Each is a 24×24 component whose solid paints are bound to `color/content/fg`; a duotone glyph's secondary shape keeps the SVG's 50% opacity.
- Import a glyph with `createNodeFromSvg` → `createComponentFromNode`, then bind each solid paint to `color/content/fg`. Re-apply a paint's `stroke-opacity`/`fill-opacity` after binding, because assigning a bound paint resets its opacity to 1. Bake anything the app applies in CSS into the SVG first — a root `transform: rotate(…)` style, or the `icon-duotone-inverted` opacity swap — because Figma has no stylesheet and would import the un-transformed glyph.

Multi-person notes:
- Publish the library so everyone consumes one source.
- On Organization, do this on a **library branch** and review before publishing; on Professional, coordinate edits manually (a real reason the upgrade helps at team scale).

What engineering can do here: **most of it can be agent-automated** (pilot-proven — see below). Via the Figma MCP server's write-to-canvas capability, an agent generates the components named by key directly from the registry's SVGs, on the **Professional plan**. Remaining human work is organization/layout and any design polish.

## Phase 3 — Code Connect (Organization/Enterprise only; additive)

Switches on **only** when the plan allows. Layers on top of Phases 1–2 with no rework:

- Add `@figma/code-connect` + a `figma.config.json`.
- Generate one `figma.connect()` mapping per icon from the registry + a **key → Figma nodeId manifest** (the nodeIds exist once Phase 2 publishes the components). The mapping emits `<Icon name="…" />` for each.
- Bulk-apply via the Figma MCP (`send_code_connect_mappings`) rather than hand-writing 332 files.
- Add a CI check that the Code Connect map stays in sync with the registry.

Because this is isolated to its own config + generated files, **flipping plans later = run the generator + apply mappings.** Nothing in Phases 0–2 changes.

## Pilot results (2026-06-24)

We validated the agent-driven path end to end against the live "Semio UI Library" file (its key is supplied by the user at session start, not committed), on the **Professional plan**:

- **Write-to-canvas works on Professional.** Figma's remote MCP server is "available on all seats and plans"; an agent (Claude Code) created components via the `use_figma` (Plugin-API) tool with no upgrade. Only Code Connect needs Organization/Enterprise.
- **Components are created named by key, faithfully.** Generated `search`, `chevron-down` (Tabler, stroke) and `box` (semio-custom, fill) from the registry's own SVGs — correct glyphs, correct names, real (instance-swappable) components. → **Phase 2 is largely agent-automatable**, reshaping it from manual design work to "generate + tidy."
- **The Code Connect gap is real and specific.** Reading components back without Code Connect (`get_design_context`) yields a **generic reconstruction**, not our API: an icon comes back as `Box`/`Search` `<img>` (not `<Icon name="box" />`), and the Button as a styled `<div>` + `<img>` + text (not `<Button variant="primary" leftIcon="save">`). Figma *variables* do surface in the readout; component *identity* does not. This is exactly — and only — what Phase 3 (Code Connect, Org-tier) upgrades.

- **The agent-built components are first-class and reusable.** Renamed into the `Icon/` namespace (grouping with the existing `Icon/Placeholder`), they appear in the Assets panel, can be instanced (a live instance of `Icon/box` was created in the pilot), and support instance-swap — identical to hand-built components. The `Icon/<key>` prefix is allowed by the naming contract (the prefix is stripped on read).

Implication: the expensive part (building the library) is reachable now on Professional; the upgrade buys the handoff *readout* quality. A `SEM-167 Pilot` frame was left in the file as evidence and can be deleted.

## Easing design→code without Code Connect (the code-side lever)

Code Connect (Org-only) is the single weak link, but its job — mapping a Figma component to our real code API — can be held on **our** side and applied by our agent, on Professional:

- **The naming convention is the mapping.** `get_design_context` returns component/variant names and variables (`data-name="box"`, `Variant=…`, `--color-primary`). Because Figma components are named by registry key and Button variants mirror our props, translating `Icon/box` → `<Icon name="box" />` and a Button frame → `<Button variant="primary" …>` is deterministic.
- **Agent-side translation = poor-man's Code Connect.** The same MCP client that writes the library can read a design and emit real components — no upgrade.
- **Make it durable** with a small repo-side mapping manifest (Figma name/variant → code component + prop rules) or a Figma Skill (markdown) the agent follows. This is Code Connect's logic, stored on our side. → **Built:** the committed [`figma/icon-manifest.json`](../figma/icon-manifest.json) (332 entries, regenerated by `npm run generate:icon-svgs`) + the translation rules in [icon-figma-handoff.md](icon-figma-handoff.md).
- **Tokens partly free:** variables already surface in the readout; aligning Figma variable names to our CSS token names tightens fidelity.

**Tradeoff vs. real Code Connect:** the remainder is native Dev-Mode snippets for devs who don't use our agent, plus Figma-hosted enforcement/analytics. For an agent-driven team this covers most of the value on Pro.

## Keeping it in sync (multi-person, anti-drift)

Three guardrails, escalating with plan:

| Guard | Catches | Available |
|---|---|---|
| Resolution test (code) | A key with no real glyph | now |
| Key manifest diff | Code has a key the Figma library is missing (or vice-versa) | Phase 1 |
| Code Connect CI | A Figma component pointing at a non-existent code key | Phase 3 (org) |

**"How to add an icon" (the one documented flow):**
1. Register it in the appropriate registry (`@semio/ui` default, `animationIconRegistry`, or `studioIconRegistry`).
2. `npm run` the generator → manifest + SVG update.
3. Import/sync the new SVG into the Figma library as a keyed component.
4. *(Org only)* re-run the Code Connect generator → mapping is added automatically.

## What I can do next, by decision

- **Regardless of plan:** build Phase 1 now (manifest + SVG export generator). This is the concrete, non-blocked deliverable and unblocks the designer for Phase 2.
- **If we upgrade:** add the Phase 3 scaffolding and generate the mappings via the MCP once the library is published.
- **If we stay on Professional:** stop after Phase 2; rely on the naming convention + manifest diff for parity.

## Status / dependencies

- **Blocks:** [VIZ-6](https://linear.app/semio-ai/issue/VIZ-6) (load existing UI library) — the keyed icon set should precede broader library work.
- **Plan blocker:** Phase 3 requires a Figma Organization/Enterprise plan + Dev/Full seat (we're on Professional). Phases 1–2 are unblocked.
