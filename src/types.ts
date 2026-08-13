import { ReactNode, MouseEvent } from "react";
import type { IconValue } from "./icons/registry";

/**
 * Theme options for the application's appearance.
 *
 * Includes Light, Dark, and System themes.
 *
 * Always reference a member (e.g. `Theme.Dark`). This is a nominal enum: a string literal (`"dark"`) is NOT
 * assignable to props/APIs typed as `Theme`.
 */
export enum Theme {
  /**
   * Light theme with bright background and dark text.
   */
  Light = "light",

  /**
   * Dark theme with dark background and light text.
   */
  Dark = "dark",

  /**
   * Follows the system's theme settings.
   */
  System = "system",
}

/**
 * Visual variants for UI components.
 *
 * Includes Primary, Secondary, Tertiary, Default, Info, Success, Warning, and Error variants.
 *
 * Always reference a member (e.g. `Variant.Primary`). This is a nominal enum: a string literal
 * (`"primary"`) is NOT assignable to props typed as `Variant`.
 */
export enum Variant {
  /**
   * Main emphasis, used for primary actions.
   */
  Primary = "primary",

  /**
   * Less emphasis than primary, used for secondary actions.
   */
  Secondary = "secondary",

  /**
   * Minimal emphasis, used for tertiary actions.
   */
  Tertiary = "tertiary",

  /**
   * Standard styling without emphasis.
   */
  Default = "default",

  /**
   * Used for informational messages or states.
   */
  Info = "info",

  /**
   * Indicates successful operations or states.
   */
  Success = "success",

  /**
   * Indicates cautionary messages or states.
   */
  Warning = "warning",

  /**
   * Indicates error messages or states.
   */
  Error = "error",
}

/**
 * Size options for UI components.
 *
 * Includes Extra Small (Xs), Small (Sm), Medium (Md), Large (Lg), and Extra Large (Xl) sizes.
 *
 * Always reference a member (e.g. `Size.Md`). This is a nominal enum: a string literal — including the
 * underlying value `"size-md"` or a guess like `"md"` — is NOT assignable to props typed as `Size`.
 * Some props accept `Size | "fit"`; in those, `"fit"` is the only valid string.
 */
export enum Size {
  /**
   * Extra small size.
   */
  Xs = "size-xs",

  /**
   * Small size.
   */
  Sm = "size-sm",

  /**
   * Medium size (default).
   */
  Md = "size-md",

  /**
   * Large size.
   */
  Lg = "size-lg",

  /**
   * Extra large size.
   */
  Xl = "size-xl",
}

/**
 * Time display format options.
 *
 * Includes Frames, Seconds+Milliseconds, Minutes+Seconds+Milliseconds, Seconds+Frames, and Seconds
 */
export enum TimeDisplay {
  /**
   * Display time in frames only.
   */
  Frames = "frames",

  /**
   * Display time in milliseconds only.
   */
  Milliseconds = "milliseconds",

  /**
   * Display time in seconds (milliseconds are decimals).
   */
  Seconds = "seconds",

  /**
   * Display time in seconds and frames format.
   */
  SecondsPlusFrames = "seconds+frames",
}

export interface ToolbarWidget {
  id: string;
  type: "toolbar-widget";
  component: ReactNode;
  mobileConfig?: {
    location: "header" | "menu";
    component?: ReactNode;
  };
}

export interface ToolbarSpacer {
  id: string;
  type: "toolbar-spacer";
}

export type ToolbarItem = ToolbarWidget | ToolbarSpacer;

export type MenuItemClickFn = (
  id: string,
  event?: MouseEvent<HTMLButtonElement>,
) => Promise<void> | void;

export enum PaneRegion {
  Footer = "footer",
  Left = "left",
  Right = "Right",
}

export interface PaneSpec {
  id: string;
  name: string;
  icon: IconValue;
  size: string | number;
  clickFn?: MenuItemClickFn;
  preventClose?: boolean;
  content?: ReactNode;
  inLeftMenu: boolean;
  inRightMenu: boolean;
  disabled?: boolean;
  region?: PaneRegion;
  /**
   * Take the content area's space as well as this pane's own, by spanning onto it.
   *
   * Deliberately separate from {@link size} rather than a `size: "full"` value:
   * `size` keeps describing how wide the pane is when it is NOT expanded, so
   * restoring needs no remembered width, and the content track keeps computing its
   * natural size the whole time a pane covers it. That is what keeps the measured
   * content rect live and truthful under expansion. Collapsing the content track
   * instead — which is what `size: "full"` does — reports a zero-width rect to
   * consumers that frame themselves from it, and leaves nothing to restore to if
   * the window is resized while expanded.
   *
   * The pane spans the grid rather than resizing tracks, so the opposite region is
   * untouched: an expanded left pane reaches the right sidebar and stops there.
   */
  expanded?: boolean;
  /**
   * Take no space, but stay mounted.
   *
   * The way to free a region's space used to be removing the pane, which unmounts
   * its content — and content does not always come back cheaply or identically. The
   * studio's animation panel is the case that forced this: its height lives in its
   * own state, so unregistering it lost the height the viewer had dragged, and
   * remounting re-created an R3F canvas that measures its container on mount and
   * can latch onto a mid-cascade size.
   *
   * Collapsing instead makes that a RESIZE — the path a resizable pane already
   * exercises on every drag — rather than a mount. The pane keeps its state, comes
   * back the size it was, and content that can idle while it has no size should,
   * the same way an occupant of a covered content area should.
   */
  collapsed?: boolean;
  shouldClose?: boolean;
  /**
   * When this pane was most recently opened into a side region, as a counter.
   *
   * Maintained by the layout — do not set it. It exists because the pane array is
   * ordered by registration, which says nothing about which of two open side panes
   * the viewer opened last. That only matters where the side regions share one row
   * and just one of them can be shown, but it has to be recorded when the pane
   * opens, since by the time it is needed the event is gone.
   *
   * Cleared whenever the pane leaves a side region, so "has one" means "is open in
   * a side region" and the highest is the one on top.
   */
  openOrder?: number;
}
