import { Pause } from "@solar-icons/react-perf/Bold";

import {
  InfoCircle,
  Command,
  HamburgerMenu,
  AltArrowDown,
  AltArrowUp,
  Stop,
  AltArrowLeft,
  AltArrowRight,
  ArrowDown,
  ArrowUp,
  Magnifer,
} from "@solar-icons/react-perf/Linear";
import {
  Planet,
  Global,
  Bag,
  UndoLeft,
  DownloadMinimalistic,
  Restart,
  Sun2,
  ClipboardCheck,
  ClipboardAdd,
  Widget,
} from "@solar-icons/react-perf/LineDuotone";
import { createSolarIcon as solar } from "./solar-glyph";
import type { IconRegistry } from "./types";

export const solarIconRegistry = {
  all: solar(Global),
  world: solar(Planet),
  /** @deprecated Use the disclosure or menu-trigger roles. */
  "chevron-down": solar(AltArrowDown),
  /** @deprecated Use DisclosureIcon. */
  "chevron-up": solar(AltArrowUp),
  /** @deprecated Use marketplace in Studio. */
  "shopping-bag": solar(Bag),
  /** @deprecated Use pane-placeholder or action-placeholder. */
  square: solar(Stop),
  /** @deprecated Use back, previous-page, or pane-collapse. */
  "chevron-left": solar(AltArrowLeft),
  /** @deprecated Use drill-in or next-page. */
  "chevron-right": solar(AltArrowRight),
  /** @deprecated Use sort-descending. */
  "arrow-down": solar(ArrowDown),
  /** @deprecated Use sort-ascending. */
  "arrow-up": solar(ArrowUp),
  /** @deprecated Use file-drop. */
  "arrow-big-down-lines": solar(DownloadMinimalistic),
  search: solar(Magnifer),
  info: solar(InfoCircle),
  undo: solar(UndoLeft),
  "player-pause": solar(Pause),
  /** @deprecated Use key-command. */
  command: solar(Command),
  /** @deprecated Use navigation-menu. */
  menu2: solar(HamburgerMenu),
  /** @deprecated Use retry. */
  rotate: solar(Restart),
  /** @deprecated Use the deprecated robot helper only. */
  rotate2: solar(Restart),
  /** @deprecated Use theme-light. */
  sun: solar(Sun2),
  /** @deprecated Use copy-complete. */
  "clipboard-check": solar(ClipboardCheck),
  /** @deprecated Use copy. */
  "clipboard-plus": solar(ClipboardAdd),
  /** @deprecated Use view-grid or option-group-placeholder. */
  "layout-grid": solar(Widget),
} satisfies IconRegistry;
