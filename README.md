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

Semio Studio mounts this repository as a git submodule at `packages/ui` and develops it
from source there. Run these commands from this package's root in either checkout:

```sh
npm ci
npm run storybook        # http://localhost:6007
npm run build-storybook  # storybook-static/
npm run typecheck
npm run lint
npm run test
npm run test:release
npm run build
npm run connect:parse
```

Package-root checks use the existing `dist` exports of `@semio/utils` and `@semio/data`.
In a standalone clone, npm installs those builds. Inside Studio, build the linked
siblings first so checks use their latest edits. From Studio's root, run
`npx turbo run lint typecheck test:unit build --filter=@semio/ui` to build
dependencies before running the package's checks and reuse cached builds.

Stories live in `stories/`; `.storybook/` supplies the light/dark toolbar and the
library's default theme. Storybook aliases only `@semio/ui` to `src/index.tsx`.
Other `@semio/*` dependencies resolve to their installed `dist` exports. npm
releases include those builds. With workspace links in Studio, build dependencies
first: from Studio's root, `npx turbo run storybook --filter=@semio/ui` or
`npx turbo run build-storybook --filter=@semio/ui` does that automatically
and reuses cached builds. Stop the dev server with Ctrl-C before handoff.
Storybook is separate from `npm run build`.

A changeset for this library belongs in this repository's `.changeset/`. Inside Studio's
mount, the changesets CLI resolves to Studio's workspace root and writes into Studio's
`.changeset/` instead, which Studio's CI rejects. There, write the file by hand under
`packages/ui/.changeset/`, or run `npx changeset` from a standalone clone.

Code Connect bindings live in `src/**/*.figma.tsx`; `npm run connect:parse` validates
those files offline without a token. `npm run connect:publish` publishes bindings to Figma.

`parity:figma` and `generate:icon-svgs` read this library's registry and components
only. Run them from this repository to check the ui manifest and export its SVGs.

Browser tests require Chromium. Install it with
`npx playwright install chromium --with-deps`, then run `npm run test:browser`
from this package's root.

In Studio, `npm run test:browser:packages` from Studio's root builds workspace dependencies
and runs the shared package browser suites. They share Studio's [browser API and React lifecycle conventions](https://github.com/semio-ai/studio/blob/main/apps/studio/browser-tests/README.md#browser-apis-and-react-lifecycle),
including awaited rendering/cleanup and explicit text-matching intent.
Hover-sensitive tests must move the pointer to an explicit target inside or outside
the component; React cleanup does not reset the browser's pointer position.
For rest-state color measurements, move the pointer outside before mounting;
a single animation frame does not guarantee that a hover transition has finished.

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

`ChipInput` accepts `readOnly` to display the selected chips without remove
buttons, an add field, a dropdown, or editing hover and focus styling. Unlike
`disabled`, it keeps the chips at their normal opacity. An empty read-only
input shows `placeholder` or an em-dash.

### Primitive contracts

`Checkbox`, `ToggleSquare`, and `Switch` render native buttons and support label
associations. Controls expose `data-state` values for styling. Menu triggers,
popups and submenu triggers expose `open`/`closed`. Tooltip and Popover triggers and
popups also expose `open`/`closed`. Check items and indicators expose
`checked`/`unchecked`, and tree parent checks also expose `indeterminate`. The menu,
Tooltip and Popover attributes are compatibility shims alongside Base UI's state
attributes, including `data-popup-open` on triggers and `data-open`/`data-closed` on
popups. Tooltip and Popover positioning uses `--transform-origin`, inherited from
the Positioner. Menu positioning also uses `--available-width`, `--available-height`
and `--anchor-width`. Other panel size variables with `--radix-` names remain
available for consumer animations.
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
- **Glyph keys** name the picture — `home`, `box`, `fit-horizontal`, `fit-vertical`.
  A glyph key with a preferred role is marked `@deprecated` with that role.

**One source per built-in key.** The default registry combines the library's drawn
`glyphIconRegistry` (`glyph.generated.ts`), Solar glyphs (`registry/solar.tsx`),
semantic roles (`registry/roles.ts`), and a curated Tabler set
(`tabler.generated.ts`). Tests enforce disjoint ownership so a shared decision
changes in the source that owns it and every consumer inherits it. A consuming
package or application supplies its domain glyphs through its own registry.

Menu items can pair a trailing status icon with `description` and
`descriptionVariant` to color the explanatory tooltip without changing the row's
label or variant.

**Overriding.** Pass replacements to `IconProvider`; nested providers merge over
their parent unless `extend={false}`:

```tsx
<IconProvider registry={{ retry: MyRetryGlyph }}>{children}</IconProvider>
```

A replacement must accept `className` and any state props its key is rendered
with (`DisclosureIcon` passes `open`, for example). Register app-specific keys
through `IconRegistryKeys` augmentation so `<Icon name>` type-checks them.

**Glyph conventions.** Glyphs draw on a 24-unit canvas with 1.5-unit strokes, default to 18px,
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

`Dropdown`, `ContextMenu`, and TooltipHost's canvas context menus use Base UI menu
parts. Menus lock page scrolling and an outside press only dismisses
the menu; a second press can activate the outside element. Dropdowns and canvas
menus leave the page exposed to assistive technology and allow focus to leave.
Row `ContextMenu` keeps the primitive's modal focus guards and background hiding.
Tab closes a Dropdown, submenus included, and resumes the surrounding tab order;
Shift+Tab closes it and returns focus to its trigger. Row context menus and canvas
context menus keep Tab and Shift+Tab on the current entry, in submenus too. A script moving focus
outside a Dropdown or canvas menu leaves it open and keeps the page exposed to
assistive technology. Escape in a submenu closes that level and returns to its
trigger. A Dropdown closing with focus inside returns focus to its trigger before
popup removal, including inside a Modal; relay wrappers focus their real control.
Tab keeps its normal focus handoff. ContextMenu returns to the element focused before
invocation, which can differ from the pressed row. Arrow keys stop at the first and
last entry, including in submenus.

ContextMenu opens below the press point with its top-left corner four pixels right
and two pixels down from it, and enters with the same vertical slide as a Dropdown;
with no room below it opens above. Menu popups have
no focus outline. Dropdown arrows use a stretched 12 by 6 SVG and account for the
popup margin on every side.

A press in the notifications region leaves a menu open, unless it is on a menu
trigger there (a toast's action menu), which closes it like any outside press. An open menu receives
Escape before a toast, including when focus is in the notification. `ContextMenu`'s
`disabled` blocks opening while keeping its child tree mounted and its open menu
navigable and dismissible. `Dropdown.nativeButton` is inferred from an intrinsic
trigger element; set it explicitly for a custom component that renders a non-button.
Mobile submenu disclosures participate in arrow-key navigation and expand inline
through a Base UI Collapsible. The disclosure is a `menuitem` with `aria-expanded`
and `aria-controls`; Enter, Space and a press each toggle it once. Closed panels
remain mounted and hidden.

SelectTree parent checkboxes are outside the tab order but remain clickable and
script-focusable. Space on the parent row toggles its check and retains focus;
Enter or ArrowRight opens its children. Enter and Space on the focused checkbox
toggle the check without opening the submenu or moving focus.

Closing selections in `NestedItem`, `NestedRadio`, `NestedCheckbox`, and `NestedSelect`
run after root close completion, popup removal and focus restoration, including
submenu selections. This lets an action open a dialog without focus being pulled
back into the menu's trigger. Items that stay open run immediately. `ActionMenu`
always invokes its action synchronously during selection to preserve browser user
activation for clipboard writes. `closeOnSelect` defaults to true for items and
radio options, and false for checkbox and multi-select options; tree checks stay
open. `NestedItem` stops closing clicks from bubbling into a listing and retains
the selected element as `currentTarget`.

`Popover` uses Base UI's non-modal Popover. Tab past its last control moves on in
the page's order and closes it. Shift+Tab from its first control returns focus to
the trigger and leaves it open. An outside press dismisses it and
activates the pressed element. A press or focus move into the notifications region keeps it open.
Escape from that region closes the Popover and leaves the toast visible.
Inside a Modal, Escape closes the Popover first, and another Escape closes the Modal.
The trigger composes the consumer's handlers, ref and classes, including
`focus:outline-none`. `open`, `onStateChange` and `portalContainer` support controlled
state and a host-owned portal. `nativeButton` overrides trigger inference for custom
components, as it does on Dropdown.

TooltipHost's interactive click overlays also use a non-modal Popover, positioned
at their virtual canvas anchor. They accept arbitrary content and expose `role="dialog"`.
A canvas point has no place in the tab order, so Tab or Shift+Tab past either end
closes the popup and returns focus to where it was before it opened. An outside press
dismisses it and activates the pressed element. Presses and focus moves into the
notifications region keep it open; Escape from that region closes the popover and
leaves the toast visible. Navigation keys stay inside the popup instead of reaching
the canvas host.
Content using `NestedItem` and other menu parts requires `mode: "context-menu"` or a
`Dropdown`. A closing canvas popup dismisses only its own invocation in the store.

Every disabled menu entry remains in the keyboard order, with or without a reason.
Arrow keys, typeahead and Home/End can reach it. A Dropdown or submenu opened from
the keyboard focuses its first enabled entry, so a disabled entry before it is
reached with ArrowUp or Home. Pointer opens, and a context menu opened from the
keyboard, focus the popup. It reports `aria-disabled` and cannot activate. For a `NestedItem`,
`description` supplies its reason; radio and select options use `disabledReason`.
The reason is a permanent accessible description and a tooltip. Enter, Space and
click leave the menu and explanation open. Escape dismisses the explanation alone;
the next Escape reaches the menu. Disabled highlights keep disabled text, icon and
indicator colours and use the default cursor.

`NestedParent`, `NestedParentProvider` and `useNestedParent` are deprecated no-ops:
one item set serves Dropdown, ContextMenu and canvas menus. Custom menu content must
use Base UI menu parts rather than mixing item providers.

`ListGrid` accepts `emptyBody` for a full-width empty row that keeps its column
headers. Pass the resolved empty state only after the read finishes. `notFound`
replaces the whole listing, including its headers.

`Tooltip` uses Base UI to display non-interactive explanations after a 700 ms hover
delay or immediately on focus-visible keyboard focus. Reopening the same tooltip
within 300 ms of closing skips the hover delay. The pointer can move from its
trigger onto the explanation and keep it visible. Opening one Tooltip closes any
other. Escape closes an open tooltip and nothing else, and still reaches the focused
element. The visible popup has `role="tooltip"` and an ID, which the
trigger's `aria-describedby` names while open; a trigger that names its own description
keeps it. The popup and trigger expose `data-state="open"` or `data-state="closed"`.
Use `Popover` for content with links or actions.
Focus in a React portal outside the trigger's DOM subtree does not open the
explanation, so a wrapped menu keeps its own Escape handling. Restoring keyboard
focus to the trigger opens the explanation normally and leaves Tab navigation available.
Pressing a trigger that is `aria-disabled` leaves its explanation open, since the press
does nothing and the explanation is usually why; an enabled trigger closes it.
A trusted scroll of a container containing the trigger closes the explanation.
Script-dispatched scroll events, including ScrollArea's pointer-entry measurement,
keep it visible. `disabled` renders the bare child. `side` defaults to top with a
six-pixel offset, and `portalContainer` selects its portal container. Tooltip's
Positioner carries `z-10` so explanations paint over overlapping Combobox popups.

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
use Base UI Menu, whose item navigation moves DOM focus away from an embedded search.
Consolidate this adapter into the shared Base UI picker when that composition
and close handoff are supported, retaining hover typing focus, double-click/F2
rename, mobile sizing, and popup-to-dialog accessibility tests. Its surface,
directional caret, and entrance animation follow the existing Dropdown styles.

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

## Releasing

Add a changeset for each pull request that changes the published package. Changesets opens
a Version Packages PR for the next version. Staging does not wait for that PR: every main
run stages the current version when npm has not published it and neither `staged/v<version>`
nor `v<version>` exists on origin, even with pending changesets.

The build uses the version commit: the latest first-parent commit on main changing the
`package.json` version line, whose version must match the current version. A merge commit
merging a Version PR counts as that commit. Its own worktree and `npm ci` keep later code
and Changesets branch handling out of the build. Successful staging creates an annotated
`staged/v<version>` there. A maintainer approves it with 2FA on npmjs.com → package → Staged
Packages, or with `npm stage approve <id>`. The next run validates each marker's ancestry
on main and package version, tags `v<version>` at its commit after npm reports publication,
and deletes the marker. An unapproved annotated marker older than seven days warns with
approval or cleanup instructions. A published current version missing both tags gets its
`v<version>` at the version commit, including when the marker push failed.

Runs happen daily, on main pushes, or by manual dispatch on main. GitHub disables public
schedules after 60 days without activity; after that, use a main push or dispatch.

A rejected version may not be stageable again under the same number; npm's documentation
does not say. Restage by bumping the version with another changeset, and delete the rejected
version's `staged/v<version>` tag from origin.

## License

Apache-2.0
