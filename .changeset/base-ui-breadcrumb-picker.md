---
"@semio/ui": minor
---

Unify breadcrumb sibling pickers on Dropdown menus. Searchable triggers now report
`aria-haspopup="dialog"`; the popup contains a `searchbox` and a menu with
`menuitemradio` choices and `menuitem` actions. Arrow keys reach Rename and the
browse action while focus stays in the search field. Selected actions run after
the menu closes, allowing them to open dialogs.

Dropdown gains a controlled `search` prop with `label`, optional `placeholder`,
`value`, and `onValueChange`. Consumers render matching entries, and closing the
menu reports an empty query.
