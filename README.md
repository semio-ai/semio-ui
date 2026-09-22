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
