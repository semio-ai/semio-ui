# Figma → code icon handoff (the code-side lever)

How to turn a Figma icon selection into real `@semio/ui` code **without Figma Code Connect** (which is Organization/Enterprise-gated — we're on Professional). This is the "code-side lever" from the [integration plan](icon-figma-integration-plan.md): Code Connect's job — mapping a Figma component to our real API — held on **our** side and applied deterministically by an agent or a developer.

## The contract

```
registry key  ==  Figma component name (Icon/<key>)  ==  code usage (<Icon name="<key>" />)
```

Because every Figma icon component is **named by its registry key** (see [icon-registry.md](icon-registry.md)), the translation is mechanical — no per-icon mapping needs to be authored or published.

## The manifest (the lookup table)

[`figma/icon-manifest.json`](../figma/icon-manifest.json) is generated from the composed registry and **committed** (unlike the bulky, gitignored SVG assets alongside it). It's the durable, machine-readable Figma↔code table — the poor-man's Code Connect map:

```json
{ "key": "delete", "source": "animation", "figmaComponent": "Icon/delete", "code": "<Icon name=\"delete\" />" }
```

- `source` = the registry that wins resolution (`studio` > `animation` > `default`), i.e. which package owns the key.
- One entry per key in the full composed app set (default, animation and studio together). The file's `count` field is the total; it is not restated here because a copy of it goes stale with every key added.

Regenerate with the registries (one command, same one that emits the SVGs):

```sh
npm run generate:icon-svgs    # in packages/ui → refreshes figma/ (SVGs + icon-manifest.json)
```

## Translation rules (what an agent/dev applies)

Reading a design via the Figma MCP (`get_design_context` returns component/variant names + variables), translate deterministically:

1. **A node named `Icon/<key>`** (or an instance-swap slot set to it) → `<Icon name="<key>" />`. Strip the `Icon/` prefix; the remainder is the key.
2. **An icon inside a component slot** (e.g. the Button's `Icon left` / `Icon right`) → the slot's prop value, not a nested element: `<Button leftIcon="<key>" rightIcon="<key>" />`.
3. **Unknown / off-contract name** → look it up in the manifest; if it's not there, it isn't a registry icon (flag it rather than guessing a key).

This is exactly what Code Connect would emit; we apply it agent-side instead. The remainder Code Connect would add (native Dev-Mode snippets for non-agent devs, Figma-hosted enforcement/analytics) is the only gap on Pro — see the [evaluation](figma-code-connect-evaluation.md).

## Keeping it in sync

The manifest is the **key checklist** for the Figma library — a diff between it and the library's `Icon/*` components surfaces drift (a code key with no Figma component, or vice-versa). Guardrails escalate with plan (resolution test now → manifest diff → Code Connect CI on Org); see the integration plan's sync table.

**Adding an icon** (the one flow):
1. Register it in the right registry (`@semio/ui` default, `animationIconRegistry`, or `studioIconRegistry`).
2. `npm run generate:icon-svgs` → SVG + manifest update.
3. Import/sync the new SVG into the Figma library as a keyed `Icon/<key>` component.
4. *(Org only)* re-run the Code Connect generator — mapping is added automatically.

## When the plan upgrades (Phase 3, drop-in)

The manifest already carries everything Code Connect needs (key → component name → code). Switching it on = add `@figma/code-connect` + a `figma.config.json`, generate one `figma.connect()` per icon from this manifest + a key→nodeId map, and bulk-apply via the MCP. Nothing here is wasted.
