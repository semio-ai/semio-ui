/**
 * Theme options for the application's appearance.
 *
 * Includes Light, Dark, and System themes
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
 * Includes Primary, Secondary, Tertiary, Default, Info, Success, Warning, and Error variants
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
 * Includes Extra Small (Xs), Small (Sm), Medium (Md), and Large (Lg) sizes
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

/**
 * Types of nested parent components.
 *
 * Includes Context and Dropdown parents
 */
export enum NestedParent {
  /**
   * Parent is a context component.
   */
  Context = "context",

  /**
   * Parent is a dropdown component.
   */
  Dropdown = "dropdown",
}
