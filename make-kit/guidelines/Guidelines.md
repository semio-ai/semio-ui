# Semio UI — Figma Make Guidelines

You are building UIs with the **Semio UI** design system (`@semio/ui`). This package is the **single
source of truth**. Your job is to **assemble** screens out of Semio components — not to recreate them.

## The most important rule

**Always import components from `@semio/ui`. Never hand-build an element that the package already
provides, and never invent props, variants, sizes, or class names that aren't in the package's TypeScript
types.** The package ships full `.d.ts` types — treat them as the authoritative catalog. If you think you need
something the package doesn't have, compose it from existing Semio components rather than building a new
primitive from raw HTML/Tailwind.

```tsx
import { Button, TextField, Select, Dialog, Tabs } from "@semio/ui";
```

## Setup (do this once, at the app root)

Import the precompiled stylesheet exactly once, at the top-level entry. It contains all design tokens and every
utility the components need — no Tailwind config is required on your side.

```tsx
import "@semio/ui/styles.css";
```

Do **not** add your own Tailwind setup to restyle Semio components, and do **not** re-import the CSS in
individual components.

## Theme / dark mode

Theming is class-based. Dark mode is driven by a `dark` class on an ancestor (the system registers
`@custom-variant dark (&:where(.dark, .dark *))`). To render dark UI, put `className="dark"` on a wrapping
element (e.g. the app root). The package also exports theme hooks — prefer them over rolling your own:

- `useTheme`, `useSystemThemePreference` — read/apply Light / Dark / System.
- The `Theme` enum (`Theme.Light | Theme.Dark | Theme.System`) is the canonical value set.

## The token model (use these, never raw hex)

Colors are semantic tokens defined in the package's `@theme`. Use the semantic names; do not hardcode hex
values or reach for raw Tailwind palette colors when a semantic token exists.

| Semantic token | Meaning | Underlying palette |
|---|---|---|
| `primary`   | Main emphasis / primary actions | sky |
| `secondary` | Secondary actions | violet |
| `tertiary`  | Tertiary accents | pink |
| `default`   | Neutral, no emphasis | neutral |
| `info`      | Informational states | teal |
| `success`   | Success states | green |
| `warning`   | Cautionary states | yellow |
| `error`     | Error / destructive states | red |

Each has the full `-50 … -950` scale (e.g. `--color-primary-600`). Layout surface tokens also exist
(`--color-layout-light-base` / `-inset` / `-deep-inset` / `-separator` and their `dark` counterparts) — use
these for panel/surface backgrounds rather than picking arbitrary grays.

## Enums are mandatory: `size`, `variant`, `theme` — NEVER use string literals

This is the single most common and most damaging mistake. `size`, `variant`, and `theme` are **nominal
TypeScript enums** exported from `@semio/ui`. You MUST import the enum and pass one of its **members**. A string
literal is NEVER valid for these props — not even the enum's own underlying value — and will fail type-checking.

```tsx
import { Button, Variant, Size } from "@semio/ui";

// ✅ CORRECT — import the enum, pass a member
<Button variant={Variant.Primary} size={Size.Md}>Save</Button>

// ❌ WRONG — string literals do NOT satisfy a nominal enum type
<Button variant="primary" size="md">Save</Button>
// ❌ STILL WRONG — even the real underlying value is rejected by the nominal enum
<Button variant="primary" size="size-md">Save</Button>
```

**Do not "fix" an enum type error by substituting a string.** There is no string that satisfies these props.
The fix is always to import the enum and reference a member. If `Size`/`Variant`/`Theme` appears unresolved,
add it to your import from `@semio/ui` — do not fall back to a string.

**`Variant` members** (import `Variant`): `Variant.Primary`, `Variant.Secondary`, `Variant.Tertiary`,
`Variant.Default`, `Variant.Info`, `Variant.Success`, `Variant.Warning`, `Variant.Error`.

**`Size` members** (import `Size`): `Size.Xs`, `Size.Sm`, `Size.Md` (default), `Size.Lg`, `Size.Xl`.
The one allowed string is `"fit"`, and only where a prop is typed `Size | "fit"` (e.g. `Button`): `size="fit"`.

**`Theme` members** (import `Theme`): `Theme.Light`, `Theme.Dark`, `Theme.System`.

### This applies to the whole library, not just Button

`size` and `variant` are the design system's **shared vocabulary** — `variant` is a prop on ~50 components and
`size` on ~20+. The enum rule is identical on every one of them; there is no component where a string is
acceptable for `size`/`variant`. Components that take them include, among others:

- **Buttons:** `Button`, `Anchor`, `MenuButton`
- **Inputs:** `TextField`, `TextArea`, `Email`, `Password`, `Search`, `Checkbox`, `Switch`, `Combobox`,
  `Autocomplete`, `ChipInput`, `ToggleGroup`, `ToggleSquare`, `ImageInput`, `Label`
- **Overlays:** `Dialog`, `Modal`, `SidebarModal`, `TabbedModal`, `Popover`, `Dropdown`, `ContextMenu`,
  `Select`, `SelectTree`, `Tooltip`, `Toast`
- **Feedback:** `Progress`, `StatusBadge`, `StatusDot`
- **Layouts:** `Tabs`, `ListGrid`, `TreeGrid`, `Breadcrumbs`, `Separator`, `Resizer`
- **Other:** `Avatar`, `Chip`, `StaticIcon`

Whenever you set `size`/`variant` on *any* component, import the enum and pass a member:

```tsx
import { TextField, Checkbox, StatusDot, Variant, Size } from "@semio/ui";

<TextField size={Size.Sm} />
<Checkbox size={Size.Md} />
<StatusDot variant={Variant.Success} size={Size.Lg} label="Connected" />
```

> Note for the curious: the enum values happen to be internal CSS class names (`Size.Md === "size-md"`), which is
> exactly why guessing a string fails — the conventional `"md"` is not the real value, and the nominal type
> rejects strings regardless. Always use the member.

## Icons

Two of Semio's components map to your Figma library (Button + Icon), so get these exactly right.

- The package ships a large set of named icon components (e.g. `Box`, `Eye`, `Home`, `Robot`, `PlayPause`,
  the `vector-*` curve icons, etc.) and re-exports Tabler icons via `@tabler/icons-react`.
- Icons inside Semio controls should use the package's standard sizing classes so they scale with the control:
  `ICON_CLASS_NAME` (`"icon-standard"`) for normal controls and `ICON_LG_CLASS_NAME` (`"icon-larger"`) for
  larger ones. Prefer passing icons into component `leftIcon` / `rightIcon` slots over absolute sizing.

## Composition over creation — examples

- Need a labeled input? Use `TextField` / `Label` from the package, not a raw `<input>`.
- Need a dropdown, menu, dialog, popover, tooltip, toast, tabs, accordion, breadcrumbs, stepper, table list?
  They all exist — import them (see `components.md`). Don't rebuild overlays with raw divs and z-index.
- Need state for tabs/layout? Use the exported hooks (`useTabsState`, `useLayoutState`,
  `use-add-toast`, etc.). A list owns its own state: `ListGrid` and `TreeGrid` take
  `selected`/`defaultSelected` directly, so there is no list-state hook to reach for.

## What NOT to do

1. **Do not** recreate Button, inputs, or overlays from raw HTML + Tailwind. Import the Semio component.
2. **Do not** pass string literals to `variant` / `size` / `theme`, ever. Import the `Variant` / `Size` /
   `Theme` enum and pass a member (see "Enums are mandatory" above). The only allowed string is `size="fit"`.
3. **Do not** hardcode hex colors or raw palette classes when a semantic token (`primary`, `error`, …) fits.
4. **Do not** add your own Tailwind config, `@import "tailwindcss"`, or theme overrides — the precompiled
   `styles.css` already carries the full system. Restyling components breaks design-system parity.
5. **Do not** pull in a different component library (shadcn, MUI, etc.). Semio UI is the only source.
6. **Do not** set per-element dark styles manually — toggle the `dark` class and let tokens respond.
7. **Do not** guess an import path. Everything is exported from the package root `@semio/ui`.

## When something is missing

If a genuinely new pattern is needed, build it by **composing** existing Semio components and tokens, keep the
same `variant`/`size` vocabulary, and note it — don't fork the design language. Flag it so it can be added to
the real codebase (which remains the source of truth).
