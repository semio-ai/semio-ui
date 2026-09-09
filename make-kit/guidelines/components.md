# Semio UI — Component Catalog

The package's TypeScript declarations (`dist/index.d.ts`) are the authoritative API. This catalog is a map of
what exists, grouped by area, so you reach for the right component. **All imports come from the package root**:
`import { X } from "@semio/ui";`

## Buttons
`Button`, `Anchor`, `HeaderButton`, `MenuButton`, `ImageButton`, `CopyLinkButton`

## Inputs
`TextField`, `TextArea`, `Email`, `Password`, `Search`, `Label`, `Checkbox`, `Switch`,
`ToggleGroup`, `ToggleSquare`, `Autocomplete`, `Combobox`, `ChipInput`, `NumberField`,
`SliderNumberField`, `TimeInput`, `ImageInput`, `ColorPickerInput`, `ColorPickerPopover`, `NumberOrList`

## Floating / overlays
`Dialog`, `Modal`, `SidebarModal`, `TabbedModal`, `Popover`, `Dropdown`, `ContextMenu`,
`Select`, `SelectTree`, `Tooltip`, `TrackedTooltip`, `Toast`, plus the 3D tooltip system (`tooltip-3d`)

## Layouts
`Accordion`, `Breadcrumbs`, `Collapse`, `Resizer`, `ScrollArea`, `Separator`, `Stepper`, `Tabs`,
`TableList`, layout `root` + layout `types`

## Feedback
`Progress`, `Spinner`, `StatusBadge`, `StatusDot`

## Nested elements (menu/tree building blocks)
`Checkbox`, `CheckboxTree`, `Radio`, `Select`, `Menu`, `Item`, `Label`, `Separator`, `ColorPicker`,
`ConfiguredRender`, plus `context` and `types`

## Other components
`Avatar`, `Chip`, `Dropzone`, `SelectList`, `FormBase`, `NodeTree`, `MenuItem`, `Snippet`,
`Keybinding` (+ `keybinding-context`)

## Hooks (use these instead of bespoke state)
`useTheme`, `useSystemThemePreference`, `useTabsState`, `useListState`, `useTableListState`,
`useLayoutState`, `useLayoutActions`, `useWindowSize`, `useClickAway`, `useDelayedBoolean`,
`use-add-toast`, layout atoms

## Shared types & enums — these are NOMINAL ENUMS, pass members not strings
`Variant`, `Size`, `Theme`, `TimeDisplay`, `PaneRegion`, `ToolbarItem` / `ToolbarWidget` / `ToolbarSpacer`,
`PaneSpec`, `MenuItemClickFn`

`Variant`, `Size`, and `Theme` are real exported **enums** — `import { Variant, Size, Theme } from "@semio/ui"`
and pass a member (`Variant.Primary`, `Size.Md`, `Theme.Dark`). A string literal will NOT type-check against
these props. Full member lists and the one `"fit"` exception are in `Guidelines.md` ("Enums are mandatory").

## Icon constants
`ICON_CLASS_NAME` = `"icon-standard"` · `ICON_LG_CLASS_NAME` = `"icon-larger"`

---

## Reference component: `Button` (verified API)

This is the exact, current signature. Treat it as the pattern for how Semio components are typed — props are
explicit, refs are forwarded, and `variant`/`size` come from the shared `Variant`/`Size` enums. That `variant`/
`size` enum pattern is **not** specific to Button: it recurs on ~50 components across the library (inputs,
overlays, feedback, layouts, avatar, chip, …), and the enum-member rule is identical on all of them.

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  altText?: string;                 // accessible label (maps to aria-label)
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: Variant;                // ENUM — pass Variant.Primary/.Secondary/.Tertiary/.Default/.Info/.Success/.Warning/.Error (never a string)
  color?: string;                   // custom color override (sets --custom-color); use sparingly, prefer variant
  leftIcon?: ReactNode;             // icon slot — pass a Semio/Tabler icon
  rightIcon?: ReactNode;
  size?: Size | "fit";              // ENUM — pass Size.Xs/.Sm/.Md/.Lg/.Xl, or the literal "fit". Never "md"/"size-md".
  deemphasize?: boolean;            // subtler background + colored text
  submit?: boolean;                 // renders type="submit"
  visuals?: "default" | "inverted" | "inverted-border" | "call-to-action" | "list-item";
}
```

Usage:

```tsx
import { Button, Variant, Size } from "@semio/ui";
import { Robot } from "@semio/ui";

<Button variant={Variant.Primary} size={Size.Md} leftIcon={<Robot className="icon-standard" />}>
  Run agent
</Button>

// Icon-only button: omit children, pass a single icon → renders as a padded square
<Button variant={Variant.Default} altText="Settings" leftIcon={<Box className="icon-standard" />} />

// Destructive action
<Button variant={Variant.Error} visuals="default">Delete</Button>
```

Rules for Button:
- Use `variant` for color intent; reach for `color` only for true one-offs.
- Icon-only buttons **must** set `altText` for accessibility.
- Use `visuals="call-to-action"` for the single primary CTA on a screen; `"inverted"` / `"inverted-border"`
  for buttons on colored or toolbar surfaces; `"list-item"` when the button is a row in a menu/list.
- Don't restyle via `className` beyond layout; let `variant`/`size`/`visuals` carry the look.

> For any other component, read its props from `dist/index.d.ts` rather than guessing. If a prop isn't in the
> types, it doesn't exist.
