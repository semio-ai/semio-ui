import { Copy, SortByTime, SortByAlphabet } from "@solar-icons/react-perf/LineDuotone";
import { IconCircle, IconSelector, IconPointFilled, IconCheck, IconClose, IconChevronRightPipe, IconExclamationMark } from "../shared-glyphs";
import { solarIconRegistry } from "./solar";
import { semioIconRegistry as glyphs } from "./semio.generated";
import { createSolarIcon as solar } from "./solar-glyph";
import type { IconRegistry } from "./types";

/**
 * Semantic **role** keys — named for their function in the UI, not their glyph
 * shape (`close`, not `close-x`; `disclosure-open`, not `chevron-down`). These are
 * the stable contract `@semio/ui`'s own components reference, and the seam a
 * consumer overrides to re-skin a role everywhere at once. The default value is a shared glyph; the key is the role. See `docs/icon-registry.md`.
 *
 * Keys are added here only as components are wired to them — an unused role key is
 * noise. (Glyph keys that already double as their role name, e.g. `search`, stay
 * in their glyph source rather than being duplicated here.)
 */
// `satisfies` (not `: IconRegistry`) so the role keys survive for `keyof` in the
// derived `IconName` type — see default-registry.ts.
export const roleIconRegistry = {
  // Affordances
  close: IconClose,
  submenu: solarIconRegistry["chevron-right"],
  // Value-picker trigger (select/combobox). The double up/down chevron is the
  // convention for "opens a list to pick from", distinct from a disclosure caret.
  "select-indicator": IconSelector,
  // Navigation. `drill-in` (go to a sub-page) shares chevron-right with `submenu`
  // by default but is a distinct role so the two can diverge.
  forward: solarIconRegistry["chevron-right"],
  back: solarIconRegistry["chevron-left"],
  "drill-in": solarIconRegistry["chevron-right"],
  "sidebar-toggle": IconChevronRightPipe,

  // Disclosure pair. Both default to the SAME chevron, so `DisclosureIcon` rotates
  // a single element (preserving the chevron animation); override them to two
  // different glyphs (e.g. `plus`/`minus`) to swap instead.
  "disclosure-closed": solarIconRegistry["chevron-down"],
  "disclosure-open": solarIconRegistry["chevron-down"],

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

  // Roles may share artwork while remaining independently replaceable.
  "add": glyphs.plus,
  "remove": glyphs.minus,
  "copy": solar(Copy),
  "copy-complete": solarIconRegistry["clipboard-check"],
  "email": glyphs.at,
  "key-shift": glyphs["arrow-big-up"],
  "key-command": solarIconRegistry.command,
  "menu-toggle": IconChevronRightPipe,
  "menu-trigger": solarIconRegistry["chevron-down"],
  "navigation-menu": solarIconRegistry.menu2,
  "theme-light": solarIconRegistry.sun,
  "theme-dark": glyphs.moon,
  "theme-system": glyphs["sun-moon"],
  "file-drop": solarIconRegistry["arrow-big-down-lines"],
  "file-select": solarIconRegistry["arrow-big-down-lines"],
  "sort-created": solar(SortByTime),
  "sort-alphabetical": solar(SortByAlphabet),
  "sort-ascending": solarIconRegistry["arrow-up"],
  "sort-descending": solarIconRegistry["arrow-down"],
  "clear-input": IconClose,
  "step-stopped": IconClose,
  "access-none": IconClose,
  "selection-indeterminate": glyphs.minus,
  "unselected": glyphs.point,
  "option-placeholder": IconPointFilled,
  "option-group-placeholder": solarIconRegistry["layout-grid"],
  "pane-placeholder": solarIconRegistry.square,
  "action-placeholder": solarIconRegistry.square,
  "select": glyphs["select-cursor"],
  "deselect": glyphs["select-close"],
  "select-all": glyphs["select-cursor"],
  "deselect-all": glyphs["select-close"],
  "state-muted": glyphs["speaker-off"],
  "state-unmuted": glyphs.speaker,
  "mute": glyphs["speaker-off"],
  "unmute": glyphs.speaker,
  "state-visible": glyphs.eye,
  "state-hidden": glyphs["eye-off"],
  "show": glyphs.eye,
  "hide": glyphs["eye-off"],
  "state-locked": glyphs.lock,
  "state-unlocked": glyphs["lock-off"],
  "unlock": glyphs["lock-off"],
  "preview-open": glyphs.eye,
  "preview-close": glyphs["eye-off"],
  "previous-page": solarIconRegistry["chevron-left"],
  "next-page": solarIconRegistry["chevron-right"],
  "pane-collapse": solarIconRegistry["chevron-left"],
  "retry": solarIconRegistry.rotate,
  "layout-settings": glyphs["panels-top-left"],
  "view-list": glyphs.list,
  "view-grid": solarIconRegistry["layout-grid"],
  "key-c": glyphs["letter-c"],
  "key-v": glyphs["letter-v"],
  "key-x": glyphs["letter-x"],
  "key-z": glyphs["letter-z"],
} satisfies IconRegistry;
