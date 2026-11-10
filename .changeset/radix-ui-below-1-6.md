---
"@semio/ui": patch
---

`radix-ui` is limited to `>=1.4.2 <1.6.0`, the releases ui is verified against. From 1.6 the menu of a held toast no longer exposes its items by role, and from 1.7 a disabled Select option loses the description that says why it is disabled, so an install that resolved a newer `radix-ui` broke both. Tree navigation accepts the element list `@base-ui/react` 1.9's composite provides, so it typechecks against both 1.5 and 1.9.
