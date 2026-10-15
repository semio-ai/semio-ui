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

Browser tests run through `npm run test:browser:packages` from the repository
root. They share Studio's [browser API and React lifecycle conventions](../../apps/studio/browser-tests/README.md#browser-apis-and-react-lifecycle),
including awaited rendering/cleanup and explicit text-matching intent.
Hover-sensitive tests must move the pointer to an explicit target inside or outside
the component; React cleanup does not reset the browser's pointer position.
For rest-state color measurements, move the pointer outside before mounting;
a single animation frame does not guarantee that a hover transition has finished.

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

`ChipInput` accepts `readOnly` to display the selected chips without remove
buttons, an add field, a dropdown, or editing hover and focus styling. Unlike
`disabled`, it keeps the chips at their normal opacity. An empty read-only
input shows `placeholder` or an em-dash.

### Icons

`<Icon name>` resolves a key through the nearest `IconProvider`, falling back to
`defaultIconRegistry`. There are two kinds of key:

- **Role keys** name what an icon does — `close`, `retry`, `disclosure-open`,
  `mute` (an action) versus `state-muted` (a state). `@semio/ui`'s own components
  reference only roles, so a role is the seam for re-skinning a behaviour
  everywhere at once.
- **Glyph keys** name the picture — `home`, `robot`, `playback-1.5`. A glyph key
  kept for compatibility is marked `@deprecated` with the role to use instead.

**Three layers, one owner per key.** This package's default registry is the base
layer: Semio's own glyphs (`src/icons/`, collected into `semio.generated.ts` by
`npm run generate:icons`), stock Solar glyphs (`registry/solar.tsx`), the
semantic roles (`registry/roles.ts`), and a curated Tabler fallback set
(`tabler.generated.ts`). `@semio/animation` adds editor, playback, data and unit
keys; Studio adds application keys. No key is defined in two places across the
three layers — tests fail on a duplicate — so a shared decision is changed in the
layer that owns it, and every consumer inherits it without an override.

The `needs-attention` semantic role uses Solar's Danger Line Duotone glyph for
states that require a user's attention. Menu items can pair a trailing status
icon with `description` and `descriptionVariant` to color the explanatory tooltip
without changing the row's label or variant.

**Overriding.** Pass replacements to `IconProvider`; nested providers merge over
their parent unless `extend={false}`:

```tsx
<IconProvider registry={{ retry: MyRetryGlyph }}>{children}</IconProvider>
```

A replacement must accept `className` and any state props its key is rendered
with (`DisclosureIcon` passes `open`, for example). Register app-specific keys
through `IconRegistryKeys` augmentation so `<Icon name>` type-checks them.

**Glyph conventions.** Glyphs draw on a 24-unit canvas with 1.5-unit strokes (the
vector family keeps its 32-unit geometry with 2-unit strokes), default to 18px,
paint with `currentColor`, and use 60% opacity for secondary strokes. Every glyph
accepts `size`, `color`, `alt`, `mirrored`, SVG attributes and a forwarded ref.
`createSolarIcon` wraps a Solar component with the same sizing and an optional
presentation class (`icon-duotone-inverted` swaps a duotone glyph's two tones).

`ProgressStepper` presents numbered, non-interactive steps for state-driven flows;
it marks the current step semantically and never offers navigation to a locked step.
Completed, current, and incomplete steps default to the success, primary, and
default variants, respectively; each variant can be configured independently.
The current step keeps an offset outline so progress is recognizable without
relying on the caption alone.

`Modal` gives initial focus to the rightmost enabled footer action. With no
available footer action, it retains the dialog primitive's default focus behavior.

`Dropdown`, `ContextMenu`, and TooltipHost's interactive canvas overlays use
modal Radix menus so focus moves from a dialog or a roving list cannot dismiss
the menu. Submenus retain focus when a dialog or list restores it outside the
menu; focus moves to parent-menu items remain normal menu navigation. Closing
selections in `NestedItem`, `NestedRadio`, `NestedCheckbox`, and `NestedSelect` run their actions after the root menu's `onCloseAutoFocus`
teardown hook, including selections in submenus. The hook follows content
unmount and `hideOthers` cleanup; a microtask lets Radix finish restoring focus
before the action opens another overlay. Base UI dialogs then establish their
background hiding without recording the menu's hidden state as pre-existing.
Items that opt to stay open run their actions immediately. Use `closeOnSelect`
to control dismissal; closing-item callbacks run after event dispatch and cannot
cancel it or alter its propagation. `NestedItem` stops closing clicks from
bubbling into a listing and preserves the selected element as `currentTarget`.
Consumers using raw Radix items or custom interactive menu content must arrange
the same teardown ordering before opening a dialog. `Popover` is nonmodal.

`ListGrid` accepts `emptyBody` for a full-width empty row that keeps its column
headers. Pass the resolved empty state only after the read finishes. `notFound`
replaces the whole listing, including its headers.

`Tooltip` displays explanatory, never interactive content on hover and keyboard
focus. The pointer can move from its trigger onto the explanation and keep it
visible; Escape dismisses it. Use `Popover` for content with links or actions.
Focus in a React portal outside the trigger's DOM subtree does not open the
explanation, so a wrapped menu keeps its own Escape handling. Restoring keyboard
focus to the trigger opens the explanation normally and leaves Tab navigation available.

**Artwork and attribution.** Solar artwork is by 480 Design under CC BY 4.0, and
the `@solar-icons/react-perf` components that render it are MIT. That package is
a dependency: external in the ESM build, and bundled into the CommonJS build
because it ships as ESM only. Tabler (MIT) is an external dependency, and a few
Tabler shapes are vendored into Semio glyphs. `NOTICE` in this package carries
the attributions, the permission texts, and the list of vendored glyphs.

See [the registry guide](docs/icon-registry.md) for resolution, composition and
naming in detail.

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
