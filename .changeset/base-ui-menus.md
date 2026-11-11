---
"@semio/ui": minor
---

Every menu runs on Base UI: `Dropdown` (and the Select, SelectTree, MenuButton, ChipInput,
color picker, breadcrumb, `ActionMenu` and layout menus built on it), row `ContextMenu`, and
TooltipHost's canvas context menu and click popover. The `Nested*` items serve all of them.

Keyboard and focus, following the WAI-ARIA menu pattern where Base UI does:

- Tab in an open `Dropdown`, a submenu included, closes it and moves on through the page;
  Shift+Tab closes it and returns focus to its trigger. Row context menus and canvas menus
  keep Tab and Shift+Tab on the focused entry, in submenus too.
- Escape in a submenu closes only that submenu.
- Every disabled entry is keyboard-reachable and `aria-disabled`, with or without a reason, and
  stays inert. A keyboard open focuses the first enabled entry; the arrow keys reach disabled
  entries before it.
- A `Dropdown` no longer hides the rest of the page from assistive technology or traps focus.
  Row context menus still do. Menus still lock page scrolling, and a press outside only closes
  the menu. Arrow keys still stop at the first and last entry.
- On Apple platforms, a submenu trigger drops `aria-expanded` while its keyboard-opened
  submenu is open, so VoiceOver announces the submenu's first entry; `aria-haspopup` remains.
- Escape returns focus to the control inside a wrapper trigger such as
  `<span><MenuButton /></span>`; a row context menu returns focus to the element focused when
  it opened.
- On mobile, a submenu's inline disclosure is a `menuitem` reached with the arrow keys.
- A SelectTree parent's checkbox is no longer a tab stop. Space on the parent row toggles it;
  Enter or ArrowRight opens its children.

API and styling:

- `Dropdown` takes `nativeButton`, inferred from an intrinsic trigger element. A custom trigger
  component that renders something other than a `<button>` passes `nativeButton={false}`.
- `NestedParent`, `NestedParentProvider` and `useNestedParent` are deprecated and do nothing.
- Menu popups size themselves with `--available-width`, `--available-height`,
  `--anchor-width` and `--transform-origin`; the `--radix-dropdown-menu-*` and
  `--radix-context-menu-*` variables are gone.
- Menu triggers, popups and check items keep their `data-state` values.
- Opening one menu by pointer closes another through Base UI's outside-press handling; menus
  opened from code are not limited to one at a time.
