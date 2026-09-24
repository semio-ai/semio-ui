# @semio/ui

Basic React components built by Semio with [Radix](https://www.radix-ui.com/)
and [Tailwind CSS](https://tailwindcss.com/) — buttons, inputs, dialogs,
popovers, menus, layout primitives, and the shared theme/size/variant system.

## Installation

```bash
npm install @semio/ui
```

Peer dependencies: `react` and `react-dom` (**19 or later**), `tailwindcss`.

React 19 is a hard requirement, not a preference: several components take `ref` as an
ordinary prop, which is React 19 behaviour — on React 18 such a `ref` is silently
dropped rather than erroring.

### Styles

Import the compiled stylesheet once, at your app's entry point:

```css
@import "@semio/ui/dist/styles.css";
```

## Usage

```tsx
import { Button, Size, Variant } from "@semio/ui";

export function Example() {
  return (
    <Button variant={Variant.Primary} size={Size.Md}>
      Save
    </Button>
  );
}
```

### Playback speed icons

`Icon` resolves `playback-0.1`, `playback-0.5`, `playback-1.0`,
`playback-1.5`, and `playback-2.0` from the default registry.
The corresponding `Playback01x`, `Playback05x`, `Playback10x`, `Playback15x`,
and `Playback20x` exports accept Solar `IconProps` (`size`, `color`, `alt`,
`mirrored`, SVG attributes, and a forwarded ref), with an 18px default size.
The decimal dot inherits `currentColor`, and the multiplication mark uses 50% opacity.

### Icon styling

Approved stock glyphs live in `src/icons/registry/solar.tsx`; semantic roles
remain in `roles.ts`. Both `sidebar-toggle` and `chevron-right-pipe` resolve to
the same glyph: an opaque chevron and a half-opacity bar. The role key lets
consumers override sidebar behavior independently of generic glyph use.

Custom affordances use an 18px default on a 24-unit canvas with 1.5-unit strokes.
The vector family retains its 32-unit geometry and uses equivalent 2-unit
strokes. `IconHandleIndicator` retains its own stateful geometry and styling.
Data-vector axes use half opacity; data points remain opaque. File drop targets
use a downward incoming-file cue; export/download actions have separate keys.

The `robot`, `folder-closed`, `folder-open`, `box-plus`, and `hand` keys use supplied
SVG artwork with its original geometry, transforms, and opacity. Their black
paints inherit `currentColor`; all accept the shared Solar props and default to 18px.

Reviewed user, moon, sun/moon, and replacement glyphs preserve the supplied SVG
artwork. Selection, nested lists, and bare percent marks use the shared Solar
conventions; graph and vertical-layout glyphs retain their custom geometry.

Vertex and Bézier glyphs keep their geometry with Solar-equivalent strokes and 18px defaults. Disclosure states share one AltArrowDown component to preserve rotation. Sidebar open/close, PanelsTopLeft, and VideocameraOff use vendored Solar LineDuotone SVGs.

Built-in registry maps have disjoint keys. The generator omits Tabler fallbacks
when UI supplies a custom or Solar glyph. Shared Solar sizing and duotone styling
ship with UI; downstream packages add semantic keys without replacing UI choices.

Semantic icons use explicit action/state roles (for example, `mute` and
`state-muted`) and shared placeholder roles. Visual compatibility keys carry
deprecation annotations in the generated registry. See
[the registry guide](docs/icon-registry.md#semantic-roles-and-compatibility-glyphs).


### Nominal enums

`Theme`, `Variant`, and `Size` are **nominal** enums: you must reference a
member, and a bare string literal is **not** assignable to a prop typed with
them.

```tsx
<Button variant={Variant.Primary} />  // ✅
<Button variant="primary" />          // ❌ type error
```

## What's inside

Components are grouped by concern and all re-exported from the package root:

- **Buttons** — `Button`, anchor / header / menu buttons
- **Inputs** — text, image, and file inputs
- **Floating** — `Dialog`, `Modal`, `Popover`, `Dropdown`, context menus
- **Feedback** — `Spinner`, progress, status
- **Layout** — `ScrollArea`, breadcrumbs, tabs, accordions and other structural
  primitives
- **Tree primitives** — composable, assembly-first building blocks for
  collapsible, selectable, keyboard-navigable hierarchical row lists
  (`TreeGrid`, `flattenTree`, `useCollapsibleTree`, `useTreeSelection`,
  `TreeRow` / `TreeIndent` / `TreeToggle`). See the composition guide:
  [`src/tree/README.md`](src/tree/README.md).
- **List primitives** — the flat analogue, on the same engine and the same row
  rhythm: `ListGrid` (columns, selection, type-ahead, responsive column hiding)
  and the presentational `ListRow`.
- **Windowing** — `ListGrid` and `TreeGrid` render every row unless asked not to.
  `virtualized` renders only the rows near the viewport, and `useRowWindow` is
  exported for consumers composing the row primitives themselves. See
  [`docs/windowed-lists.md`](docs/windowed-lists.md).
- **Theming** — the `Theme` / `Variant` / `Size` enums and supporting hooks

## License

MIT
