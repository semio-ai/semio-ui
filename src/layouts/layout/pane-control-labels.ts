import type { PaneSpec } from "../../types";

/**
 * What a pane's controls are called when the pane does not name them.
 *
 * Neutral on purpose: the layout renders these for every Right-region pane, and a
 * name that describes one kind of pane is false for the others.
 */
const DEFAULT_OPEN_LABEL = "Toggle side panel";
const DEFAULT_CLOSE_LABEL = "Close panel";

/** The accessible name for the control that opens `pane` — see {@link PaneSpec.openLabel}. */
export function paneOpenLabel(pane: Pick<PaneSpec, "openLabel"> | undefined): string {
  return pane?.openLabel || DEFAULT_OPEN_LABEL;
}

/** The accessible name for the controls that close `pane` — see {@link PaneSpec.closeLabel}. */
export function paneCloseLabel(pane: Pick<PaneSpec, "closeLabel"> | undefined): string {
  return pane?.closeLabel || DEFAULT_CLOSE_LABEL;
}
