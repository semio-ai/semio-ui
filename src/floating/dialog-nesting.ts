import { createContext, useContext } from "react";

/**
 * Whether the nearest enclosing package dialog is a `Dialog`.
 *
 * Base UI draws a dialog's backdrop only for the outermost of nested Base UI dialogs,
 * and `Dialog`, `Modal` and `SidebarModal` are all Base UI dialogs. A `Modal` or
 * `SidebarModal` opened from a `Dialog` would therefore lose its backdrop and leave the
 * confirmation behind it undimmed, so it forces its backdrop while this is `true`. One
 * opened from another `Modal` keeps Base UI's single backdrop: `Modal` and
 * `SidebarModal` set this back to `false` for their own content.
 */
export const InsideDialogContext = createContext(false);

export function useInsideDialog(): boolean {
  return useContext(InsideDialogContext);
}
