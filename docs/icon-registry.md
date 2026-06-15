# Icon System: Context-Based Icon Registry

**Status:** Proposed
**Author:** Andy Schoen
**Linear:** [SEM-159](https://linear.app/semio-ai/issue/SEM-159) (epic) · [SEM-160](https://linear.app/semio-ai/issue/SEM-160) (this doc) · SEM-161 (implementation) · SEM-162 (consumers + Figma)

## Problem

Icon handling in `@semio/ui` is currently ad-hoc and easy to break:

- Each icon is a distinct imported component, so icon *identity* is tied to a concrete import rather than a stable key.
- Sizing is re-derived per consuming component (e.g. the `Button` icon container uses `sized-height sized-width` with the glyph at `icon-standard` = `h-3/5 w-3/5`). The 60%-of-container rule is implicit and repeated, so it drifts.
- There is no single source of truth for *which* icon library is in use or *how* icons render, which makes swapping or theming icon sets painful.
- It round-trips poorly with Figma: because every icon is its own component, there is no shared, serializable handle that both code and design agree on.

## Goals

- One `<Icon name="…" />` component; icon identity is a **string key**.
- A **registry** resolving keys to concrete icon components, provided via React context, with a sensible default library.
- Sizing standardized in exactly one place.
- Consumers can override or extend the registry (swap icon sets, add product-specific icons).
- Clean Figma parity: the string key maps to a Figma instance-swap selection through Code Connect.

## Non-Goals

- Replacing the underlying icon artwork. The default set remains [`@tabler/icons-react`](https://tabler.io/icons), which `@semio/ui` already depends on.
- Building a runtime icon-font or dynamic SVG fetcher.
- Shipping the implementation or migrating consumers — those are SEM-161 and SEM-162.

## Proposed Solution (code)

A React context holds a registry mapping string keys to icon components. A single `<Icon>` component reads the registry, resolves `name`, and applies standardized sizing. A default registry is built from Tabler so the system works with zero configuration.

```tsx
// registry.ts
export type IconComponent = React.ComponentType<{ className?: string }>;
export type IconRegistry = Record<string, IconComponent>;

// Default registry: the generated Tabler set merged with @semio/ui's own custom
// icons (src/icons/), keyed kebab-case. Custom icons win on key collision.
export const defaultIconRegistry: IconRegistry = {
  ...tablerIconRegistry,   // generated from @tabler/icons-react
  ...semioIconRegistry,    // generated from @semio/ui's own src/icons/ exports
};
```

```tsx
// icon-provider.tsx
import { useOptionalContext } from "@semio/utils";

// Built on the shared @semio/utils context infrastructure (see below) rather than
// a bespoke createContext — null sentinel + fallback to defaultIconRegistry.
const IconRegistryContext = React.createContext<IconRegistry | null>(null);

export function IconProvider({
  registry,
  extend = true,
  children,
}: {
  registry: IconRegistry;
  extend?: boolean; // merge over the parent/default registry (true) or replace it (false)
  children: React.ReactNode;
}) {
  // Resolve up the tree; fall back to the default set at the root.
  const parent = useOptionalContext(IconRegistryContext) ?? defaultIconRegistry;
  const value = React.useMemo(
    () => (extend ? { ...parent, ...registry } : registry),
    [parent, registry, extend],
  );
  return <IconRegistryContext.Provider value={value}>{children}</IconRegistryContext.Provider>;
}
```

```tsx
// icon.tsx
import { ICON_CLASS_NAME } from "./constants/icon";

export interface IconProps {
  name: string;
  className?: string;
  /** Optional: opt into the larger preset used by toggle-style controls. */
  size?: "standard" | "larger";
}

export function Icon({ name, className, size = "standard" }: IconProps) {
  const registry = useOptionalContext(IconRegistryContext) ?? defaultIconRegistry;
  const Resolved = registry[name];
  if (!Resolved) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`<Icon> unknown name "${name}". Did you register it?`);
    }
    return null; // or a known fallback glyph
  }
  const sizeClass = size === "larger" ? ICON_LG_CLASS_NAME : ICON_CLASS_NAME;
  return <Resolved className={clsx(sizeClass, className)} />;
}
```

Sizing stays anchored to the existing constants (`icon-standard` / `icon-larger`), but now they are applied in exactly one place (`<Icon>`) rather than re-derived per component. Consuming components provide the **slot** (the square sized to the control), and `<Icon>` fills it at the standard proportion.

### Build on the shared `@semio/utils` context infrastructure

The registry context should **not** hand-roll a bare `React.createContext` + `useContext`. `@semio/utils` already provides the house pattern for context providers (`packages/utils/src/react/context-providers.tsx`), and `@semio/ui` already consumes it for the tooltip context (`packages/ui/src/context/tooltip-context-utils.tsx`). The icon registry should follow suit for consistency and to inherit the same resolution/nesting guarantees:

- **`createContextSolution({ context, defaultValue, name })`** — returns a standardized `{ useContext, Provider, withOptional, context }` bundle, including a required-context hook that throws a clear, named error when used outside a provider.
- **`useOptionalContext(context)`** — non-throwing resolution that walks up the tree, returning `null` when no ancestor provides one (so `<Icon>` and `IconProvider` can fall back to `defaultIconRegistry` at the root).
- **`withOptionalContext` / `composeContexts`** — "natural resolution": a component self-provides the default **only if no ancestor already provides it**, avoiding double-wrapping when providers nest, and composes cleanly with the existing Tooltip/Animation/Scene providers.

This gives the icon system hierarchical, nesting-aware resolution for free — the nearest `IconProvider` wins, and the default registry is the implicit root.

### The default registry includes `@semio/ui`'s own custom icons

`@semio/ui` ships ~50 custom icons of its own in `src/icons/` (Semio-specific glyphs: `home`, `robot`, the keyframe/vector/vertex curve-editing marks, player transport, file-type badges, etc.). These must be in the **default** registry so `<Icon name="home" />` resolves the Semio glyph with zero configuration — the default is *not* just Tabler:

```tsx
export const defaultIconRegistry: IconRegistry = {
  ...tablerIconRegistry, // generated from @tabler/icons-react
  ...semioIconRegistry,  // generated from @semio/ui's own src/icons/ exports
};
```

The package's custom icons are spread **last**, so they take precedence on key collision — an intentional Semio glyph overrides the Tabler default of the same key.

Two practical wrinkles the SEM-161 codegen must handle:

- **Inconsistent export names.** The existing icons are not uniformly prefixed (`IconHome`, `IconPlayerNextKey`, but also bare `Angle`, `Lock`, `Speaker`, `SelectClose`). Codegen normalizes each export to a kebab-case key: strip an optional `Icon` prefix, then PascalCase → kebab (`IconHome` → `home`, `Angle` → `angle`, `IconPlayerNextKey` → `player-next-key`, `IconVectorBezierAutoClamp` → `vector-bezier-auto-clamp`).
- **A parametric subset is not a plain glyph.** Some exports take more than `{ className }` and won't satisfy `IconComponent`: stateful icons (`IconPlayPause` has `center: "play" | "pause"`), wrapper components (`StaticIcon`, `WorldElementIcon`), and the easing-curve family (`IconVectorSine`, `IconVectorCubic`, …). The codegen registers only `className`-compatible exports and curates/excludes the rest; those remain available as direct imports (or are registered under explicit per-state keys if needed). The generated `semioIconRegistry` is therefore a filtered, not blanket, map of `src/icons/`.

**One registry-specific extension on top of the base pattern.** The utils infra resolves a context as *replace-or-inherit* (use the nearest provider, else the default). The icon registry additionally wants **merge-on-nest**: a nested `IconProvider` with `extend` should compose its keys *over* the parent registry (`{ ...parent, ...registry }`) rather than shadow it entirely. So `IconProvider` reads the parent via `useOptionalContext` and merges, while still building on the utils-created context/hook so the rest of the resolution semantics (and the `<Icon>` consumer hook) stay standardized. `extend: false` falls back to the base replace behavior.

### Why a registry beats per-icon imports

- **Serializable identity.** An icon becomes a `name` string — trivially storable, themeable, and (critically) representable in Figma.
- **One swap point.** Product surfaces can `IconProvider`-override a handful of keys without touching call sites.
- **Tree-shaking preserved.** The default registry is generated; consumers that ship a curated registry pull in only the icons they register.

## Figma Mapping

The tension: code wants a **string** (`name`), but Figma needs **real components** to render a glyph — it cannot draw an icon from a free-text string. Figma's native "pick one of a set" mechanism is the **instance-swap** property. So the bridge is:

> registry key  ==  Figma icon component name  ==  Code Connect output

A designer swaps in an icon component visually; Code Connect translates the chosen component's name back into the `name` string. Three ways to model the Figma side:

| Option | How it works | Verdict |
|---|---|---|
| **Instance-swap from a named icon library** | One published icon library; components named by key; component/control slots are instance-swap properties. | **Recommended.** Scales to Tabler's full set; searchable picker; Code Connect reads the chosen component's name. Needs per-icon Code Connect, but those are generated. |
| **Single Icon with a `name` variant enum** | One component, a variant property enumerating icons. | Maps most directly to `figma.enum`, and Figma renders the right glyph per variant — but a variant property with thousands of values is unusable. Viable only for a **curated subset**. |
| **Single Icon with a text `name` prop** | One component, a text property. | Closest to the code shape and trivial Code Connect (`figma.string`), but Figma can't render the glyph from the string (static placeholder). Fails visual fidelity. |

**Recommendation:** instance-swap from a named icon library for the full set, optionally a small curated variant-enum `Icon` for zero-setup defaults.

## Code Connect

With the recommended model, Code Connect composes cleanly. Each icon component maps to an `<Icon name>` call; a control's instance-swap slot maps through it.

```ts
// Generated per icon — mechanical, one per icon component.
figma.connect(IconChevronDown, "https://figma.com/…/Icon?node-id=…", {
  example: () => <Icon name="chevron-down" />,
});

// Button maps its slot through the swapped instance.
figma.connect(Button, "https://figma.com/…/Button?node-id=…", {
  props: {
    label: figma.string("Label"),
    leftIcon: figma.boolean("Left icon", {
      true: figma.instance("Icon left"),
      false: undefined,
    }),
  },
  example: ({ label, leftIcon }) => <Button leftIcon={leftIcon}>{label}</Button>,
});
```

The per-icon Code Connect files are repetitive and **generated** by a script that walks the Figma icon library (or the registry) and emits one mapping per icon — the component name *is* the `name` argument.

## Naming Contract

The whole system hinges on one rule, enforced by lint/codegen:

- Registry keys are **kebab-case** (`chevron-down`).
- Figma icon component names equal the registry key (allowing an `icon/` prefix for organization, stripped on read).
- Code Connect output uses the same key.

This is the same discipline the color tokens already follow (token name == code-syntax `var(--…)`).

## Migration Path

1. **Phase 1 (this doc, SEM-160).** Agree the API and the Figma/Code Connect contract.
2. **Phase 2 (SEM-161).** Land `IconProvider`, `registry`, `<Icon>`, the generated default registry (Tabler **plus** `@semio/ui`'s own `src/icons/`), and standardized sizing in `@semio/ui`. Keep `Button`'s `leftIcon`/`rightIcon` working by accepting either a node (legacy) or rendering `<Icon name>` internally; add a codemod for the common cases.
3. **Phase 3 (SEM-162).** Migrate `apps/studio` and other consumers to `<Icon name>` / registry overrides; publish the Figma icon library; generate Code Connect; point component slots at the library.

Backwards compatibility: `leftIcon`/`rightIcon` continue to accept a `ReactNode` during the transition, so the change is non-breaking; call sites migrate incrementally to `leftIcon={<Icon name="…" />}` or a future `leftIconName` shorthand.

## Risks & Open Questions

- **Per-icon Code Connect volume.** Mitigated by generation; needs a maintained codegen step in CI.
- **Curated vs. full set in Figma.** A full Tabler library is large; we may seed with the icons actually used in `apps/studio` and grow on demand.
- **Custom-icon precedence & coverage.** The default registry merges `@semio/ui`'s own `src/icons/` over Tabler (custom wins on collision). Confirm that precedence direction, and decide how the parametric/stateful custom icons (`IconPlayPause`, `StaticIcon`, `WorldElementIcon`, the easing `IconVector*` family) are handled — excluded from the registry vs. registered under explicit per-state keys. These Semio glyphs also need names in the Figma icon library (SEM-162), not just the Tabler set.
- **Fallback behavior.** Decide whether an unknown `name` renders nothing, a visible "missing icon" glyph (dev), or throws in CI.
- **Shorthand ergonomics.** Whether to add `leftIconName`/`rightIconName` props to controls in addition to the generic slot.

## References

- `packages/ui/src/constants/icon.ts` — `ICON_CLASS_NAME` (`icon-standard`), `ICON_LG_CLASS_NAME` (`icon-larger`).
- `packages/ui/src/icons/` — `@semio/ui`'s own custom icons, folded into the default registry alongside Tabler.
- `packages/ui/dist/styles.css` — `.icon-standard { h-3/5 w-3/5 }`, `.icon-larger { h-[70%] w-[70%] }`.
- `packages/utils/src/react/context-providers.tsx` — shared context infrastructure (`createContextSolution`, `useOptionalContext`, `withOptionalContext`, `composeContexts`) the `IconProvider` should build on; `packages/utils/src/react/context-providers-example.md` documents the pattern.
- `packages/ui/src/context/tooltip-context-utils.tsx` — existing in-package precedent using that infrastructure.
- Figma Code Connect — `figma.instance`, `figma.boolean`, `figma.string`, `figma.enum`.
