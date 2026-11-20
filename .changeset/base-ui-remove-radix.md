---
"@semio/ui": minor
---

Style controls and overlays with Base UI's presence attributes. The library no
longer sets `data-state`; migrate selectors using this table. All listed
attributes are present with an empty value when true and absent when false.

| Removed `data-state` value and element                                                     | Replacement                                                                                                                                                        |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `open` on popups, panels, or a Collapse root                                               | `[data-open]`                                                                                                                                                      |
| `closed` on popups or Collapse roots/panels                                                | `[data-closed]`                                                                                                                                                    |
| `open` on menu, submenu, Popover, or Tooltip triggers                                      | `[data-popup-open]`                                                                                                                                                |
| `closed` on those triggers                                                                 | `:not([data-popup-open])`                                                                                                                                          |
| `open` on Accordion or Collapse triggers                                                   | `[data-panel-open]`                                                                                                                                                |
| `closed` on those triggers                                                                 | `:not([data-panel-open])`                                                                                                                                          |
| `open` on Accordion items or headers                                                       | `[data-open]`                                                                                                                                                      |
| `closed` on Accordion items, headers, or panels                                            | `:not([data-open])`                                                                                                                                                |
| `checked` / `unchecked` on checkboxes, switches, and menu check/radio items and indicators | `[data-checked]` / `[data-unchecked]`                                                                                                                              |
| `indeterminate` on checkboxes and aggregate tree checks                                    | `[data-indeterminate]`                                                                                                                                             |
| `on` / `off` on toggles or ToggleGroup items                                               | `[data-pressed]` / `:not([data-pressed])` (Base UI also sets `data-pressed` on an open menu or Popover trigger and on a Combobox input, so scope it to the toggle) |
| `on` / `off` on Tabs                                                                       | `[data-active]` / `:not([data-active])`                                                                                                                            |
| Progress `loading` / `complete` / `indeterminate`                                          | `[data-progressing]` / `[data-complete]` / `[data-indeterminate]`                                                                                                  |
| Combobox item `checked` / `unchecked`                                                      | `[data-selected]` / `:not([data-selected])`                                                                                                                        |
| Autocomplete suggestion `unchecked`                                                        | `[data-unchecked]`                                                                                                                                                 |
| Mobile submenu item `open` / `closed`                                                      | `[data-open]` / `:not([data-open])`                                                                                                                                |
| Toast `open` / `closed`                                                                    | Toasts remain mounted during exit; use `[data-starting-style]` / `[data-ending-style]` for entrance / exit styling                                                 |

`DisclosureIcon.fromGroupState` now reads `data-panel-open` on its `group`
ancestor (the Accordion trigger); absence means closed.

Replace `--radix-collapsible-content-{height,width}` with
`--collapsible-panel-{height,width}` on Collapse panels. On Accordion panels,
both the `--radix-collapsible-content-{height,width}` aliases and
`--radix-accordion-content-{height,width}` become `--accordion-panel-{height,width}`.
Replace `--radix-toast-swipe-move-{x,y}` and `--radix-toast-swipe-end-{x,y}` with
`--toast-swipe-movement-{x,y}`.

`radix-ui` is no longer a dependency, which supersedes the range limit on it in
this release. Import raw `Collapsible` parts from `@base-ui/react/collapsible` and
use Base UI props and attributes.

The `data-checked:` Tailwind variant now selects the `data-checked` attribute; it
previously selected `data-ui~="checked"`, which no component sets. The unused
`.radix-accordion-content` rule is removed.

A tree parent row (`NestedCheckboxTree`, `SelectTree`) takes the open fill while
its submenu is open, as every other submenu entry does.
