import { ReactNode, MouseEvent } from "react";

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
  icon: ReactNode;
  size: string | number;
  clickFn?: MenuItemClickFn;
  preventClose?: boolean;
  content?: ReactNode;
  inLeftMenu: boolean;
  inRightMenu: boolean;
  disabled?: boolean;
  region?: PaneRegion;
  shouldClose?: boolean;
}
