---
"@semio/ui": minor
---

`BreadcrumbTrail`: a switcher can list further option groups under its own options. `switcher.groups` takes `{ label, options }[]`; each non-empty group renders after a separator under its own label, sharing the switcher's `value` and `onSelect`, so the current page is marked wherever it is listed. Rendered by the menu form only — a `searchable` or renameable switcher filters one flat list and does not show them. `BreadcrumbOptionGroup` is exported.

`BreadcrumbTrail`: the current crumb takes the same 208px width when it has a switcher as when it is renameable, so a short name keeps a full-size target.

`Modal`: `fitHeight` lets a dialog's height follow its content instead of the 18rem desktop floor, for a dialog holding one short field.
