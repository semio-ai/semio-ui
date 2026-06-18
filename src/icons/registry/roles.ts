import {
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronRightPipe,
  IconCircle,
  IconExclamationMark,
  IconPointFilled,
  IconSelector,
  IconX,
} from "@tabler/icons-react";
import type { IconRegistry } from "./types";

/**
 * Semantic **role** keys — named for their function in the UI, not their glyph
 * shape (`close`, not `close-x`; `disclosure-open`, not `chevron-down`). These are
 * the stable contract `@semio/ui`'s own components reference, and the seam a
 * consumer overrides to re-skin a role everywhere at once. The default *value* is
 * a Tabler glyph; the key is the role. See `docs/icon-registry.md`.
 *
 * Keys are added here only as components are wired to them — an unused role key is
 * noise. (Glyph keys that already double as their role name, e.g. `search`, stay
 * in the Tabler set rather than being duplicated here.)
 */
export const roleIconRegistry: IconRegistry = {
  // Affordances
  close: IconX,
  submenu: IconChevronRight,
  // Value-picker trigger (select/combobox). The double up/down chevron is the
  // convention for "opens a list to pick from", distinct from a disclosure caret.
  "select-indicator": IconSelector,
  // Navigation. `drill-in` (go to a sub-page) shares chevron-right with `submenu`
  // by default but is a distinct role so the two can diverge.
  back: IconChevronLeft,
  "drill-in": IconChevronRight,
  "sidebar-toggle": IconChevronRightPipe,

  // Disclosure pair. Both default to the SAME chevron, so `DisclosureIcon` rotates
  // a single element (preserving the chevron animation); override them to two
  // different glyphs (e.g. `plus`/`minus`) to swap instead.
  "disclosure-closed": IconChevronDown,
  "disclosure-open": IconChevronDown,

  // Selection state
  selected: IconCheck,
  "radio-selected": IconPointFilled,

  // Stepper
  "step-complete": IconCheck,
  "step-pending": IconCircle,

  // Status — discrete keys so each is independently overrideable; replaces the old
  // `IconVariant` switch (variant → glyph).
  "status-success": IconCheck,
  "status-error": IconExclamationMark,
  "status-warning": IconExclamationMark,
  "status-info": IconExclamationMark,
};
