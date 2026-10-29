# @semio/ui

Basic React components built by Semio with [Base UI](https://base-ui.com/),
[Radix](https://www.radix-ui.com/) and [Tailwind CSS](https://tailwindcss.com/) —
buttons, inputs, dialogs, popovers, menus, layout primitives, and the shared
theme/size/variant system.

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

## Development and Storybook

Run commands from this package's root, either in its own repository or in a
Studio checkout:

```sh
npm install
npm run storybook        # http://localhost:6007
npm run build-storybook  # storybook-static/
npm run typecheck
npm run lint
npm run test
```

Stories live in `stories/`; `.storybook/` supplies the light/dark toolbar and the
library's default theme. Storybook aliases only `@semio/ui` to `src/index.tsx`.
Other `@semio/*` dependencies resolve to their installed `dist` exports. npm
releases include those builds. With workspace links in Studio, build dependencies
first: from Studio's root, `npx turbo run storybook --filter=@semio/ui` or
`npx turbo run build-storybook --filter=@semio/ui` does that automatically
and reuses cached builds. Stop the dev server with Ctrl-C before handoff.
Storybook is separate from `npm run build`.

## Usage

Run browser tests with `npm run test:browser` from this package's root. In Studio,
`npm run test:browser:packages` from Studio's root builds workspace dependencies
and runs the shared package browser suites. They share Studio's [browser API and React lifecycle conventions](https://github.com/semio-ai/studio/blob/main/apps/studio/browser-tests/README.md#browser-apis-and-react-lifecycle),
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

### Primitive contracts

`Checkbox`, `ToggleSquare`, and `Switch` render native buttons and support label
associations. Controls expose `data-state` values for styling. Panel size variables
with `--radix-` names remain available for consumer animations.
Toggle groups expose single selection through `role="radio"` and `aria-checked`;
the current focus target participates directly in the Tab order.

Use `Collapse` for a titled disclosure. For raw Radix parts with Radix props and
`data-state`, import `Collapsible` directly from `radix-ui`.

Use the Base UI `ToastManager` with `useAddToast` to show notifications. Hover or focus inside
the viewport pauses the timeout ring and dismissal. F8 focuses the viewport.
Toasts support right swipes and remain clickable above dialogs. The toast owns its
frame and wall clocks; Base UI's timeout is disabled so both clocks share pauses
and holds. Menu popups portal inside the notifications region to keep their presses
inside surrounding overlays, and menu interactions do not start a toast swipe.

Each `addToast` is a new notification, even under an id that is listed or leaving:
its interval and screen-reader announcement restart. `updateToast` merges patches
synchronously; changing `id` replaces the notification in its list position with a
new interval and announcement, removable through the new id.

### Toast clipboard details

`ToastData.clipboardContent?: string` adds an outlined clipboard icon button in the
header, immediately before Close. Its accessible label and tooltip are **Copy details**. Supply the exact text to copy, with formatting and any redaction handled
by the caller. The payload is not displayed in the toast. A successful copy shows
**Copied**; a failed copy shows an inline message and allows retry. Copying holds
the dismissal interval until it settles and does not dismiss the toast or invoke
its labeled action.

Toasts with clipboard content or an action menu default to ten seconds; ordinary
toasts default to four. A numeric `dismiss` still overrides the duration.
Hovering or focusing the toast
pauses dismissal. See `ui/ToastManager` → **Clipboard Examples** in Storybook.

```tsx
addToast({
  id: crypto.randomUUID(),
  title: "Project save failed",
  content: "Your changes are still here. Try saving again.",
  variant: Variant.Error,
  clipboardContent: JSON.stringify({ operation: "save-project", error: "No response" }, null, 2),
});
```

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

`Dialog` uses Base UI `AlertDialog` and places actions in its footer. Initial focus
goes to the closing footer Cancel when present, otherwise to X; when that control is
disabled on open, focus stays where it was until the first Tab. Closing returns
focus to the element focused before opening. Opened from a `Modal`, a `Dialog` dims
the `Modal` with its own backdrop, and Escape closes only the `Dialog`. A `Modal` or
`SidebarModal` opened from a `Dialog` likewise dims the `Dialog`; one opened from
another `Modal` adds no second backdrop. Set
`closeOnCancelClick={false}` for a cancel action that changes a step; X remains a
separate dismissal action. Async flows use `closeOnSubmitClick={false}`,
`submitDisabled`, `cancelDisabled` and `dismissDisabled` until their action
settles. Overlay dismissal is opt-in through `closeOnOverlayClick`. `NestedMenu`
accepts `right` content beside its disclosure icon for indicators shared with
ordinary menu items.

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

A disabled menu entry with a reason stays in the menu's keyboard order. For a
`NestedItem` the reason is its `description`; for a `NestedRadio` or `NestedSelect`
option it is `disabledReason`, because an option's `description` says what choosing
it means. Arrow keys, typeahead and Home/End reach the entry, and a menu opened from
the keyboard focuses it when it comes first. It reports `aria-disabled`, and the
reason is its accessible description and its tooltip, so it reaches keyboard and
screen-reader users. Enter, Space and a click do nothing, leave the menu open and
leave the reason showing. Focused, the entry takes a lighter fill than an enabled row
and keeps its disabled text, icon and indicator colours; under the pointer it shows
the default cursor. A disabled entry without a reason is skipped, and so is an option
disabled by its group unless it has its own `disabledReason`.

`ListGrid` accepts `emptyBody` for a full-width empty row that keeps its column
headers. Pass the resolved empty state only after the read finishes. `notFound`
replaces the whole listing, including its headers.

`Tooltip` displays explanatory, never interactive content on hover and keyboard
focus. The pointer can move from its trigger onto the explanation and keep it
visible; Escape dismisses it. Use `Popover` for content with links or actions.
Focus in a React portal outside the trigger's DOM subtree does not open the
explanation, so a wrapped menu keeps its own Escape handling. Restoring keyboard
focus to the trigger opens the explanation normally and leaves Tab navigation available.
Pressing a trigger that is `aria-disabled` leaves its explanation open, since the press
does nothing and the explanation is usually why; an enabled trigger closes it.
Scrolling a container of the trigger closes the explanation, and the pointer entering a
`ScrollArea` around the trigger does not.

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

### Layout navigation actions

Footer `ActionItem` entries with `onClick` render as direct buttons on desktop and
direct items in the mobile menu. Without `onClick` they open their configured
menu. A pane's `clickFn` can return `false` (synchronously or asynchronously) to
handle a navigation action without toggling the selected pane.

### Breadcrumb navigation

`BreadcrumbTrail` takes a flat `items` array. Each item supplies its label and an
optional ancestor `href`, `onNavigate` callback, sibling `switcher`, custom `node`,
or `onRename` callback. Routes, data fetching and permission checks belong to the
consumer. The existing tree-based `Breadcrumbs` API remains available.

On mobile, ancestor labels with sibling menus collapse into an overflow trigger.
Consumers should keep the ancestor destination available in that menu. Ancestor
labels navigate independently of their menu chevrons on desktop. A current label
opens its sibling menu. With `onRename`, double-click or the Rename menu action
opens a text field: Enter or blur commits a nonempty trimmed name, and Escape
cancels. Read-only consumers omit `onRename`. Search filters supplied options and
renders at most 50 matches; `browse` provides a destination for the full listing.

Sibling choices and browse actions accept optional `icon` values; editable crumbs
accept `renameIcon`. These use the same registry-key or element slots as other UI
controls. Consumers choose domain icons and provide their registry overrides.

`labelWidth` reserves a label width in pixels and renders its sibling trigger as
a separate adjacent segment, including on the current page. This lets consumers
keep predefined navigation choices the same width on listing and detail pages.

`BreadcrumbTrailItem.showRenameAction` can hide the menu action while keeping
`onRename` double-click and F2 editing, when another surface provides a rename form.

The `toolbar-segments` style gives adjacent controls a 2px gap and square shared
edges, preserving rounded exposed ends. It also handles text-field wrappers and
nested segment rows.

Searchable and editable breadcrumb pickers use Base UI combobox primitives and the shared combobox style helpers. Their input retains DOM focus while pointer and keyboard navigation highlight options. Closing selections run after the popup closes, allowing consumers to open a dialog. Display labels are semantic picker triggers; F2 starts optional inline renaming.

The searchable/editable breadcrumb picker is an internal migration adapter, not a template
for new popups. The shared Combobox currently provides an inline search input;
it does not expose a custom trigger with search inside the popup, a fixed
header/action footer, or an action callback after popup teardown. Shared menus
still use Radix, whose item hover moves DOM focus away from an embedded search.
Consolidate this adapter into the shared Base UI picker when that composition
and close handoff are supported, retaining hover typing focus, double-click/F2
rename, mobile sizing, and popup-to-dialog accessibility tests. Its surface,
directional caret, and entrance animation follow the existing Dropdown styles.

## License

MIT

### Report-sized dialogs

`Dialog` accepts `size="medium"` for a 36rem width capped to the viewport, and
`footer` for custom React content replacing its standard actions. Custom footer
buttons must explicitly handle closing. Long body content scrolls while the header
and footer remain visible. Omitting these props retains content sizing and the
standard cancel/submit actions.

### Generic action menus

`ActionMenu` renders a caller-supplied `ActionMenuSpec` (`icon`, `label`, `items`).
Items have an `id`, `label`, optional `icon`/`description`/`disabled`, and `onSelect`
returning `Result<string | void, string>` synchronously or asynchronously. A success
string is feedback; an error string is a user-facing explanation. The caller owns
all domain behavior, data, destinations and messages. Unexpected exceptions receive
a generic retry message.

`ToastData.actionMenu` adds the icon-only version beside Close and takes precedence
over `clipboardContent`. Toasts with menus default to ten seconds. The toast owns
its dismissal interval, counted in wall time so it ends on time when frames lag, and
paused while the page is hidden and during hover/focus, an open menu, or a pending
action; action feedback restarts the reading interval. A `dismiss` of `Infinity`
keeps the toast until it is dismissed. Menus close after selection without
dismissing the toast. `ActionMenu` also supports a labeled trigger, open/busy/feedback
callbacks, and a portal container for hosts with their own stacking context.
