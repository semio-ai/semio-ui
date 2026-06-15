# @semio/ui

Basic React components built by Semio with [Radix](https://www.radix-ui.com/)
and [Tailwind CSS](https://tailwindcss.com/) — buttons, inputs, dialogs,
popovers, menus, layout primitives, and the shared theme/size/variant system.

## Installation

```bash
npm install @semio/ui
```

Peer dependencies: `react`, `react-dom`, `tailwindcss`.

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
- **Layout** — breadcrumbs and other structural primitives
- **Theming** — the `Theme` / `Variant` / `Size` enums and supporting hooks

## License

MIT
