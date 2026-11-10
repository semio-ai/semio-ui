---
"@semio/ui": minor
---

The Accordion follows the keyboard behaviour of the [APG accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/): ArrowUp, ArrowDown, Home and End no longer move focus between Accordion headers, so a keyboard user can scroll the page to read an opened panel. Tab and Shift+Tab move between headers, and Enter and Space open and close a section.

Those four keys, pressed on a header, now reach ancestors and document listeners, where they were stopped at the header before. A shortcut an application binds to them at the document level now fires while an Accordion header has focus.

`@semio/ui` requires `@base-ui/react` 1.9 or later, which provides this behaviour. Releases before 1.6 moved focus with the arrow keys, so the earlier range let an install behave either way. An application that also depends on `@base-ui/react` directly needs 1.9 or later to share one copy with ui.
