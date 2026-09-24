# Icon System: Context-Based Icon Registry

Icons in `@semio/ui` are addressed by a **string key** resolved through a
context **registry**, not by importing a concrete icon component at each call
site. One `<Icon name="…" />` component reads the registry, resolves the key,
and applies standardized sizing. This document describes how that works and why
it is preferred over per-icon imports.

## Problem it solves

Tying icon identity to a concrete import is easy to break:

- Icon *identity* is a concrete import rather than a stable key, so it can't be
  themed, swapped, or serialized.
- Sizing is re-derived per consuming component (the 60%-of-container rule
  applied by hand in each icon slot), so it drifts.
- There is no single source of truth for *which* icon library is in use or *how*
  icons render, which makes swapping or theming an icon set painful.
- It round-trips poorly with Figma: because every icon is its own component,
  there is no shared, serializable handle that both code and design agree on.

## How it works

A React context holds a registry mapping string keys to icon components. A single
`<Icon>` reads the registry, resolves `name`, and applies standardized sizing. A
default registry is built so the system works with zero configuration.

```tsx
// types.ts
// Icons may accept a state bag beyond className (see "Roles, glyphs, and
// stateful icons"); the Record is the deliberately-loose seam, kept honest by
// the typed wrappers.
export type IconComponent = React.ComponentType<{ className?: string } & Record<string, unknown>>;
export type IconRegistry = Record<string, IconComponent>;
```

```tsx
// default-registry.ts
// The generated Tabler set merged with @semio/ui's own custom icons
// (src/icons/), keyed kebab-case. The sets have disjoint keys.
export const defaultIconRegistry: IconRegistry = {
  ...tablerIconRegistry, // generated from @tabler/icons-react
  ...semioIconRegistry,  // generated from @semio/ui's own src/icons/ exports
  ...solarIconRegistry,  // approved stock Solar glyph replacements
  ...roleIconRegistry,   // hand-maintained semantic role keys
};
```

```tsx
// icon.tsx
export function Icon({ name, className, size = "standard", ...rest }: IconProps) {
  const registry = useOptionalContext(IconRegistryContext) ?? defaultIconRegistry;
  // Own-property check so an unexpected `name` (e.g. "toString", "constructor")
  // can't resolve an inherited Object.prototype member instead of an icon.
  const Resolved = Object.hasOwn(registry, name) ? registry[name] : undefined;
  if (!Resolved) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`<Icon> unknown name "${name}". Register it via <IconProvider>.`);
    }
    return null;
  }
  const sizeClass =
    size === "none" ? undefined : size === "larger" ? ICON_LG_CLASS_NAME : ICON_CLASS_NAME;
  return <Resolved className={clsx(sizeClass, className)} {...rest} />;
}
```

Sizing is anchored to the constants `icon-standard` (60% of the slot) and
`icon-larger` (70%), applied in exactly one place (`<Icon>`) rather than
re-derived per component. Consuming components provide the **slot** (the square
sized to the control), and `<Icon>` fills it at the standard proportion;
`size="none"` opts out for bespoke slots that size the glyph themselves.

### `IconProvider` and nesting-aware resolution

`IconProvider` builds on the shared `@semio/utils` context infrastructure
(`createContextSolution` / `useOptionalContext`, the same house pattern the
tooltip context uses) rather than a hand-rolled `createContext`. Resolution is
**nearest-provider-wins**, with the default registry as the implicit root.

```tsx
// icon-provider.tsx
export function IconProvider({ registry, extend = true, children }: IconProviderProps) {
  const parent = useOptionalContext(IconRegistryContext) ?? defaultIconRegistry;
  const value = React.useMemo(
    () => (extend ? { ...parent, ...registry } : registry), // merge-on-nest
    [parent, registry, extend],
  );
  return <IconRegistryContext.Provider value={value}>{children}</IconRegistryContext.Provider>;
}
```

The one extension over the base pattern is **merge-on-nest**: a nested provider
with `extend` (the default) composes its keys *over* the parent registry rather
than shadowing it entirely, so a deeper provider adds/overrides keys without
losing the ones it doesn't set. `extend: false` replaces the registry outright.

### The default registry includes `@semio/ui`'s own custom icons

`@semio/ui` ships its own custom glyphs in `src/icons/` (Semio-specific marks:
`home`, `robot`, the keyframe/vector/vertex curve-editing marks, player
transport, file-type badges, etc.). These are in the **default** registry so
`<Icon name="home" />` resolves the Semio glyph with zero configuration — the
default is *not* just Tabler. Each built-in key has one owner. The generator excludes native/custom/Solar keys
from the Tabler fallback map, so shared decisions do not rely on spread order.

The default Tabler set is **curated, not the full library.** Tabler ships
thousands of icons; `@semio/ui` itself only references a few dozen, and the
package bundles its dependencies, so a full default map would inline megabytes.
`tablerIconRegistry` is generated from an **explicit seed** (`TABLER_SEED` in the
codegen) — explicit rather than import-scanned, because `@semio/ui`'s own
components render through `<Icon name>`. Entries with a custom or Solar owner are
filtered out of this seed before generation.
`@tabler/icons-react` is marked **external** in the build, so even seeded icons
resolve at the consumer instead of bloating the bundle. Apps register whatever
else they use via `<IconProvider>`.

The two generated maps are produced by `scripts/generate-icon-registry.mjs`
(`npm run generate:icons`; outputs are committed). Two wrinkles it handles:

- **Inconsistent export names.** The custom icons are not uniformly prefixed
  (`IconHome`, `IconPlayerNextKey`, but also bare `Angle`, `Lock`, `Speaker`).
  Codegen normalizes each export to a kebab-case key: strip an optional `Icon`
  prefix, then PascalCase → kebab (`IconHome` → `home`, `Angle` → `angle`,
  `IconPlayerNextKey` → `player-next-key`).
- **Some exports are not plain glyphs.** A component must satisfy `IconComponent`
  (`{ className?: string }`). Wrappers (`StaticIcon`, `WorldElementIcon`) and any
  component with a **required prop** beyond `className` are excluded from the
  generated map and remain available as direct imports. The dts typecheck is the
  backstop — anything mistakenly registered that isn't assignable to
  `IconComponent` fails the build.

### Roles, glyphs, and stateful icons

Keys fall into two kinds, and the distinction drives how they're named and
overridden:

- **Role keys** name a *function in the UI*, not a picture: `close`, `back`,
  `drill-in`, `submenu`, `select-indicator`, `sidebar-toggle`,
  `disclosure-open`/`disclosure-closed`, `selected`, `radio-selected`,
  `step-complete`/`step-pending`, and `status-success`/`status-error`/
  `status-warning`/`status-info`. The three chevron families are deliberately
  distinct, per UI convention: **`disclosure`** (single rotating caret —
  reveal/expand, e.g. accordion/collapse), **`select-indicator`** (double up/down
  chevron — value pickers like select/combobox), and **`submenu`** (static right
  chevron — flyout/nested menus and tree nodes). The glyph is just the default
  *value*; overriding `close` re-skins every close affordance at once. Role keys
  are named for the **role, not the glyph** — `close`, not `close-x`;
  `disclosure`, not `chevron-down` (re-encoding the shape defeats the
  indirection). They live in a hand-maintained `roles.ts`, and a key is added
  only as a component is wired to it — an unused role key is noise.
- **Glyph keys** name an *arbitrary picture* used as content — `star`, `home`,
  `heart`, `trash`. These keep their literal names; a caller asking for
  a star wants a star.

`@semio/ui`'s own components reference **role keys**; they are the stable
contract that also seeds the Figma library / Code Connect naming. Glyph keys are
the convenience layer for consumers.

**Stateful icons.** Some roles render different glyphs by state — the disclosure
chevron rotates (or swaps `+`/`−`) on open; the keyframe glyph varies by
`dashed`/`center`/`fill`. Rather than a one-off branch inside each consuming
component, the variation logic lives **inside the icon component**, and `<Icon>`
forwards a *state bag* to it:

```tsx
<Icon name="disclosure" open={open} />    // default component rotates on `open`
<Icon name="key" dashed center="plus" />  // IconKey reads its own props
```

This is why `IconComponent` accepts `{ className?: string } & Record<string,
unknown>`. The default `disclosure` component rotates a single element; an
override that resolves to two different glyphs swaps instead — the consuming
component is unchanged either way. A role's prop shape is part of its contract:
an override must honor it.

**Typed wrappers keep the loose seam honest.** The `Record<string, unknown>` is
the *only* loose spot, confined to resolution/theming. Everyday call sites stay
type-checked one of two ways: a literal-key `<Icon name="check" />` (no state),
or a thin typed wrapper for stateful roles — `<KeyIcon dashed center="plus" />`,
`<DisclosureIcon open />` — that forwards checked props into `<Icon name>`. No
caller hand-casts props; the looseness never leaks into app code.

**Enumerable sets get discrete keys, not one stateful component.** Where the
variation is a small, independently-themeable set, prefer discrete keys. Status
icons are the case: `status-success` / `status-error` / `status-warning` /
`status-info` (each independently overrideable), used as
``<Icon name={`status-${variant}`} />``. Rule of thumb: a **stateful component**
when the variation is animated / continuous / multi-dimensional (`disclosure`,
`key`); **discrete keys** when it's a small enumerable set a consumer may want to
reskin one at a time (`status-*`).

### Nesting & library composition (directionality)

Because resolution is nearest-wins with `{ ...parent, ...registry }` merging, on
a key collision the *deeper* provider wins: an ancestor override takes effect for
every key a nearer provider doesn't itself set, but a nearer provider's explicit
key shadows the ancestor. This is correct for "library brings defaults, app
overrides," and backwards for "app has final authority" — a library that
re-registers a common role key (`close`) could quietly defeat app theming from
above. To keep app authority intact:

- **Libraries export a registry *object*, not their own `<IconProvider>`.**
  `@semio/animation` exports `animationIconRegistry`; the app composes it where
  it controls precedence: `<IconProvider registry={{ ...animationIconRegistry,
  ...appIcons }}>`. Last-wins; the app has the final say.
- If a library *does* render its own provider, keep it **additive-only** —
  net-new keys, no shared role keys — so ancestor overrides always pass through.

### Consumer model — icon slots take a key *or* a node

Every `@semio/ui` icon slot — `Button`'s `leftIcon`/`rightIcon`, the `icon`
props across menus/selects/inputs/tabs/breadcrumbs/sidebars, `Chip`'s `icon`,
etc. — accepts **either a registry key string or a node**:

```tsx
<Button leftIcon="trash" />                 // string key → <Icon name="trash"> internally
<Button leftIcon={<Icon name="trash" />} /> // an explicit node
<Button leftIcon={<CustomGlyph />} />       // any node
<Chip icon="home" />                        // same rule on every slot
```

Mechanically, slots keep a `ReactNode` type (`ReactNode` already permits a
string) and each render site funnels the value through the exported
`resolveIcon(value)` helper — a string key becomes a self-sizing `<Icon name>`,
any node passes through unchanged (`resolveIcon` is idempotent). Sizing is
handled by `<Icon>`; the consumer never imports `ICON_CLASS_NAME`. There is
**one** way to reference an icon (key string or `<Icon>`); `@semio/ui`
deliberately does **not** add parallel `*IconName` string props per component.

## Why a registry beats per-icon imports

- **Serializable identity.** An icon becomes a `name` string — trivially
  storable, themeable, and (critically) representable in Figma.
- **One swap point.** Product surfaces can `IconProvider`-override a handful of
  keys without touching call sites.
- **Lean by default.** The default registry is a curated seed, and
  `@tabler/icons-react` is external — so `@semio/ui` doesn't ship the full icon
  library. Consumers register only what they additionally need.

## Figma mapping

The tension: code wants a **string** (`name`), but Figma needs **real
components** to render a glyph — it cannot draw an icon from a free-text string.
Figma's native "pick one of a set" mechanism is the **instance-swap** property.
So the bridge is:

> registry key  ==  Figma icon component name  ==  Code Connect output

A designer swaps in an icon component visually; Code Connect translates the
chosen component's name back into the `name` string. The recommended model is
**instance-swap from a named, published icon library** (components named by key;
component slots are instance-swap properties): it scales to the full set, gives a
searchable picker, and Code Connect reads the chosen component's name. The
alternatives — a single component with a `name` variant enum (unusable past a
small curated subset) or a free-text `name` prop (Figma can't render the glyph) —
don't hold up for the full set.

```ts
// Generated per icon — the component name is the `name` argument.
figma.connect(IconChevronDown, "https://figma.com/…/Icon?node-id=…", {
  example: () => <Icon name="chevron-down" />,
});

// Button maps its slot through the swapped instance.
figma.connect(Button, "https://figma.com/…/Button?node-id=…", {
  props: {
    label: figma.string("Label"),
    leftIcon: figma.boolean("Left icon", { true: figma.instance("Icon left"), false: undefined }),
  },
  example: ({ label, leftIcon }) => <Button leftIcon={leftIcon}>{label}</Button>,
});
```

The per-icon Code Connect files are repetitive and **generated** by a script that
walks the icon library (or the registry) and emits one mapping per icon.

## Naming contract

The system hinges on one rule, enforced by lint/codegen:

- Registry keys are **kebab-case** (`chevron-down`).
- **Role keys are named for the role, not the glyph** — `close` not `close-x`,
  `disclosure` not `chevron-down`, `selected` not `check`. Glyph/content keys
  keep their literal names.
- Figma icon component names equal the registry key (an `icon/` prefix for
  organization is allowed, stripped on read).
- Code Connect output uses the same key.

This is the same discipline the color tokens follow (token name == code-syntax
`var(--…)`).

## References

- `packages/ui/src/icons/registry/` — the implementation: `icon.tsx`,
  `icon-provider.tsx`, `icon-context.ts`, `default-registry.ts`, `roles.ts`,
  `disclosure.tsx`, `key-icon.tsx`, `types.ts`, and the generated
  `tabler.generated.ts` / `semio.generated.ts`.
- `packages/ui/scripts/generate-icon-registry.mjs` — codegen for the two
  generated registries (`npm run generate:icons`).
- `packages/ui/src/constants/icon.ts` — `ICON_CLASS_NAME` (`icon-standard`),
  `ICON_LG_CLASS_NAME` (`icon-larger`).
- `packages/ui/src/icons/` — `@semio/ui`'s own custom icons, folded into the
  default registry alongside Solar glyphs and compatibility fallbacks.
- `packages/utils/src/react/context-providers.tsx` — shared context
  infrastructure the `IconProvider` builds on.
- `packages/ui/src/context/tooltip-context-utils.tsx` — existing in-package
  precedent using that infrastructure.

The `all` role uses Solar Global LineDuotone for complete selections. Studio
uses the separate `public` role (Earth LineDuotone) for its public sharing audience.

### Built-in layer ownership

UI owns base glyphs and UI roles. Animation adds editor actions, playback and data
aliases. Studio adds application concepts. The three shipped maps have disjoint
keys; change artwork in its earliest owning layer. Consumer providers still allow
intentional theming overrides. Registry tests enforce this distinction.

`edit`, `menu`, and `settings` are owned by Animation, including the Solar Pen,
vertical MenuDots, and inverted Settings decisions. Inverted duotone CSS ships
with UI's stylesheet, so it does not depend on Studio. `home`, `box`, `project`,
and custom data glyphs are owned by UI; direct exports use the same artwork.

### Deprecated robot compatibility keys

`line`, `pencil`, `pinned`, `transform-point`, and `view360` remain registered for
compatibility with the deprecated `WorldElementIcon` helper. Its only Studio
consumer is `RobotBuilderWidget`, which is not mounted or imported by the app.
Avoid using these entries for new features; define a semantic role and review
its artwork if robot editing is introduced. The generator preserves the
`@deprecated` annotations on these registry properties.

### Semantic roles and compatibility glyphs

Feature call sites use role names: `theme-*`, `sort-*`, `key-*`,
`option-placeholder`, `option-group-placeholder`, `preview-open`/`preview-close`,
and action/state pairs such as `mute` and `state-muted`. Distinct roles may
share a component; overriding one role must not change another.

The generated custom map keeps visual glyph keys for external compatibility.
Approved replacements are recorded in the generator's `DEPRECATED_CUSTOM_KEYS`
and emitted as `@deprecated` annotations. These glyph names are implementation
details for composing roles; new feature code should use semantic keys.

UI owns shared add/copy/remove and selection roles because UI components consume
them. Animation owns transition/view roles and oriented playback bounds. Studio
owns access roles (`role-*`) and domain/navigation aliases. The maps remain
disjoint, and each key has one owner. `key` remains the animation data-key name;
keyboard legends use `key-command`, `key-shift`, and `key-c/v/x/z`.

Five supplied `time-display-*` glyphs are registered, including seconds-frames
and ticks. Registration does not enable a time format in a control or formatter.
