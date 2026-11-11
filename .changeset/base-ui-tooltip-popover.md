---
"@semio/ui": minor
---

Move Tooltip, Popover and TooltipHost's canvas click overlays to Base UI.

- Tooltip and Popover triggers and popups expose compatibility `data-state="open"` / `"closed"` attributes alongside Base UI's state attributes. A Tooltip trigger's `data-state` is `open` while open; `delayed-open` and `instant-open` are no longer set. Tooltip and Popover transform origins use the inherited `--transform-origin` variable.
- The visible Tooltip popup carries `role="tooltip"` and an ID, and the trigger's `aria-describedby` names it while open, unless the trigger names its own description. There is no visually hidden copy of the tooltip's text.
- Tooltip opens after 700 ms of hover or immediately on focus-visible keyboard focus, supports instant reopening within 300 ms, and remains hoverable. Pressing an aria-disabled trigger keeps its explanation open. A trusted ancestor scroll dismisses it, and script-dispatched measurement scrolls keep it visible. Escape dismisses an explanation before its surrounding menu.
- Non-modal Popover allows Tab and Shift+Tab to follow the surrounding tab order. Tabbing out closes it. Inside a Modal, Escape closes the Popover first, and another Escape closes the Modal.
- Interactive canvas click overlays use non-modal Popover semantics with arbitrary content and `role="dialog"`. Initial focus moves to the first tabbable element. Tab or Shift+Tab past either end closes it and returns focus to where it was before it opened, since a canvas point has no place in the tab order. Page scrolling stays available, and an outside press dismisses the popup and reaches the pressed element. Buttons use normal activation behavior. Content using NestedItem or other menu parts requires `mode: "context-menu"` or a Dropdown. Close completion dismisses only the invocation that rendered the popup.
