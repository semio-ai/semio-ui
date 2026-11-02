# Figma icon handoff

The committed manifest and naming convention provide ui's Figma-to-code table
in place of Code Connect for icons. An agent or developer can apply the mapping
without a native Dev Mode snippet; see the
[plan evaluation](figma-code-connect-evaluation.md) for the plan-dependent features.

The code and design contract is:

```text
registry key == Figma component name (Icon/<key>) == code usage (<Icon name="<key>" />)
```

[`figma/icon-manifest.json`](../figma/icon-manifest.json) is the committed lookup
table for ui's default registry only. Each entry has a key, `source: "default"`,
`figmaComponent: "Icon/<key>"` and the corresponding `<Icon name="<key>" />` code.
Because components are named by registry key, translation is mechanical and
requires no hand-authored mapping per icon. The manifest's `count` field records
its size; copying the count into prose would go stale as keys change. Committing
the table makes the mapping durable even though the bulky SVG assets are ignored.

Run `npm run generate:icon-svgs` from the repository root to regenerate the manifest,
`figma/icon-svgs.generated.json` and individual SVGs in `figma/icon-svgs/`. The SVG
outputs are ignored by git. The script reads only this repository's registry.

Translate an `Icon/<key>` component or instance into `<Icon name="<key>" />`.
Inside a component slot, use the matching icon prop, such as
`<Button leftIcon="save">Save</Button>`. Check unknown names against the manifest;
flag names absent from the manifest instead of guessing a key. Strip the `Icon/`
prefix when reading the key. Consumer-owned icons require the consumer's registry
and key augmentation. Slots translate into their icon prop values so the result
uses the component's API.

One Figma library holds the icon components. Ui's tooling owns only ui's mappings;
consuming packages and applications supply their own mappings in that library.
The destination in `figma.config.json` is the shared library destination.

To add a generic icon, register it in ui, run `npm run generate:icons` and
`npm run generate:icon-svgs`, then sync its SVG as `Icon/<key>`. Run
`npm run parity:figma` to compare the committed ui manifest with a fresh export
and check ui component contracts. The local parity check does not read live Figma.
Comparing the manifest's key checklist with the library's `Icon/*` components catches missing or extra design
components; the local check alone cannot catch that drift.

Code Connect mappings can use the same names and instance-swap slots. Local
parsing uses `npm run connect:parse`; publishing requires access to the configured
Figma library. The manifest already contains key, component name and code; a
key-to-node-ID map supplies the remaining input for generated Code Connect
mappings. This is an additive layer: the SVGs, names and translation rules remain
useful when enabling it. Native Dev Mode snippets and Figma-hosted mapping
enforcement are additional benefits for developers who do not use agent-side
translation. See [the integration plan](icon-figma-integration-plan.md).
