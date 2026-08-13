import { atom, useAtomValue } from "jotai";
import { ActionItem } from "../layouts/layout/types";
import { PaneRegion, PaneSpec, ToolbarItem } from "../types";
import { useIsDesktop } from "./use-is-desktop";

export const menuStateAtom = atom<boolean>(true);

const panesBaseAtom = atom<PaneSpec[]>([]);

/** The side regions — the ones that share a row when there is no width to dock them. */
const SIDE_REGIONS: readonly PaneRegion[] = [PaneRegion.Left, PaneRegion.Right];

const isSideRegion = (region: PaneRegion | undefined): boolean =>
  region !== undefined && SIDE_REGIONS.includes(region);

/**
 * Monotonic, module-scoped: it only has to order panes against each other within a
 * session, and it never resets, so a value can't be reused while the pane holding
 * it is still open.
 */
let nextOpenOrder = 1;

/**
 * The panes, with `openOrder` maintained on write.
 *
 * Stamped here rather than at the call sites because panes are opened from several
 * of them — the menu, the header toggle, a selection registering its own pane — and
 * an unstamped path would silently order wrong. Every write goes through this atom,
 * so this is the one place that sees all of them.
 *
 * A pane entering a side region without an order gets the next one; leaving a side
 * region clears it. That second rule is also how a caller asks for a pane to be
 * brought to the front: clear the order while leaving the region set, and the pane
 * is re-stamped as the most recently opened.
 */
export const panesAtom = atom(
  (get) => get(panesBaseAtom),
  (get, set, next: PaneSpec[] | ((previous: PaneSpec[]) => PaneSpec[])) => {
    // An updater is accepted so a mutation can be expressed as a function of the
    // CURRENT panes, read here at write time. Callers used to rebuild from a ref
    // mirroring this atom through a subscription, which left a window where two
    // mutations landing in the same commit each rebuilt from a snapshot the other
    // had already invalidated, and one silently won — the bug documented at length
    // in the studio's `use-selection-pane`. Reading through `get` closes that
    // window, and makes a batch of updates expressible as a single write.
    const previous = get(panesBaseAtom);
    const resolved = typeof next === "function" ? next(previous) : next;
    // An updater returning its own input means "nothing to do". Without this the
    // mapping below would still allocate a new array and notify every subscriber.
    if (resolved === previous) {
      return;
    }
    set(
      panesBaseAtom,
      resolved.map((pane) => {
        if (!isSideRegion(pane.region)) {
          return pane.openOrder === undefined ? pane : { ...pane, openOrder: undefined };
        }
        return pane.openOrder === undefined ? { ...pane, openOrder: nextOpenOrder++ } : pane;
      }),
    );
  },
);

/**
 * Open side panes, oldest first — the back-stack, with the last entry on top.
 *
 * Only panes with content: `PanelContent` and `SidePaneArea` both skip a pane
 * without any, so an empty one is not something the viewer can be looking at.
 */
export const sidePaneStackAtom = atom<PaneSpec[]>((get) =>
  get(panesAtom)
    .filter((pane) => isSideRegion(pane.region) && pane.content !== undefined && !pane.shouldClose)
    .sort((a, b) => (a.openOrder ?? 0) - (b.openOrder ?? 0)),
);
export const toolbarItemsAtom = atom<ToolbarItem[]>([]);
export const actionItemsAtom = atom<ActionItem[]>([]);
export const homeActionItemAtom = atom<ActionItem | undefined>(undefined);

export const activeLeftPaneAtom = atom<string | undefined>((get) => {
  const panes = get(panesAtom);
  const active = panes.find((p) => p.region === PaneRegion.Left && !p.shouldClose);
  return active?.id;
});

export const activeRightPaneAtom = atom<string | undefined>((get) => {
  const panes = get(panesAtom);
  const active = panes.find((p) => p.region === PaneRegion.Right && !p.shouldClose);
  return active?.id;
});

// A collapsed pane is still registered and still mounted, but takes no space —
// so it must not hold its region's gap open either, or the layout keeps a strip
// of padding for something with no size. See `PaneSpec.collapsed`.
export const leftRegionActiveAtom = atom<boolean>((get) => {
  const panes = get(panesAtom);
  return panes.find((p) => p.region === PaneRegion.Left && !p.collapsed) !== undefined;
});

export const rightRegionActiveAtom = atom<boolean>((get) => {
  const panes = get(panesAtom);
  return panes.find((p) => p.region === PaneRegion.Right && !p.collapsed) !== undefined;
});

export const footerRegionActiveAtom = atom<boolean>((get) => {
  const panes = get(panesAtom);
  return panes.find((p) => p.region === PaneRegion.Footer && !p.collapsed) !== undefined;
});

export const leftWidthAtom = atom<string>((get) => {
  const panes = get(panesAtom);
  const left = panes.filter(
    (pane) => pane.region === PaneRegion.Left && pane.content !== undefined && !pane.collapsed,
  );
  if (left.length === 0) return "0fr";
  if (left.find((l) => l.size === "full")) return "1fr";
  if (left.length === 1) {
    return formatSize(left[0].size);
  }
  return `max(${left.map((l) => formatSize(l.size)).join(",")})`;
});

export const rightWidthAtom = atom<string>((get) => {
  const panes = get(panesAtom);
  const right = panes.filter(
    (pane) => pane.region === PaneRegion.Right && pane.content !== undefined && !pane.collapsed,
  );
  if (right.length === 0) return "0fr";
  if (right.find((l) => l.size === "full")) return "1fr";
  if (right.length === 1) {
    return formatSize(right[0].size);
  }
  return `max(${right.map((l) => formatSize(l.size)).join(",")})`;
});

export const rightPaneIdsAtom = atom<string[]>((get) => {
  const panes = get(panesAtom);
  const right = panes.filter(
    (pane) => pane.inRightMenu && !pane.disabled && pane.content !== undefined,
  );
  return right.map((v) => v.id);
});

export const contentWidthAtom = atom<string>((get) => {
  const panes = get(panesAtom);
  const leftFull = panes.find(
    (pane) => pane.region === PaneRegion.Left && pane.content && pane.size === "full",
  );
  const rightFull = panes.find(
    (pane) => pane.region === PaneRegion.Right && pane.content && pane.size === "full",
  );
  if (leftFull || rightFull) return "0fr";
  return `1fr`;
});

/**
 * Whether a side pane is expanded over the content area — spanning onto it rather
 * than taking its track ({@link PaneSpec.expanded}).
 *
 * Kept separate per region because the span is directional: a left pane spans
 * rightwards to the content's far edge, a right pane leftwards, and each stops at
 * the other region.
 */
export const leftExpandedAtom = atom<boolean>((get) =>
  get(panesAtom).some(
    (pane) => pane.region === PaneRegion.Left && pane.content !== undefined && pane.expanded,
  ),
);

export const rightExpandedAtom = atom<boolean>((get) =>
  get(panesAtom).some(
    (pane) => pane.region === PaneRegion.Right && pane.content !== undefined && pane.expanded,
  ),
);

/**
 * Whether anything the viewer can see is in the content area.
 *
 * False when a pane covers it, either by spanning over it (`expanded`) or by
 * collapsing its track (a legacy `size: "full"` pane). This is an OPTIMISATION
 * signal, not a correctness one: the measured content rect stays truthful under a
 * span, so a consumer that ignores this still frames itself correctly — it just
 * keeps drawing something nobody can see. Consumers that can cheaply idle (a 3D
 * canvas, a video, a ticking chart) should.
 */
export const contentVisibleAtom = atom<boolean>((get) => {
  if (get(leftExpandedAtom) || get(rightExpandedAtom)) {
    return false;
  }
  return get(contentWidthAtom) !== "0fr";
});

export const leftMenuItemsAtom = atom<PaneSpec[]>((get) =>
  get(panesAtom).filter((p) => p.inLeftMenu),
);
export const rightMenuItemsAtom = atom<PaneSpec[]>((get) =>
  get(panesAtom).filter((p) => p.inRightMenu),
);

function formatSize(val: string | number): string {
  if (typeof val === "string") return val;
  return `${val.toString()}px`;
}

export function useMenuState() {
  const menuState = useAtomValue(menuStateAtom);
  return menuState;
}

export function usePanes() {
  const panes = useAtomValue(panesAtom);
  return panes;
}

export function useSidePaneStack() {
  return useAtomValue(sidePaneStackAtom);
}

export function useToolbarItems() {
  const toolbarItems = useAtomValue(toolbarItemsAtom);
  return toolbarItems;
}

export function useActionItems() {
  const actionItems = useAtomValue(actionItemsAtom);
  return actionItems;
}

export function useHomeActionItem() {
  const homeActionItem = useAtomValue(homeActionItemAtom);
  return homeActionItem;
}

export function useLeftMenuItems() {
  const leftMenuItems = useAtomValue(leftMenuItemsAtom);
  return leftMenuItems;
}

export function useRightMenuItems() {
  const rightMenuItems = useAtomValue(rightMenuItemsAtom);
  return rightMenuItems;
}

export function useRightPaneIds() {
  const rightPaneIds = useAtomValue(rightPaneIdsAtom);
  return rightPaneIds;
}

export function useLeftWidth() {
  const leftWidth = useAtomValue(leftWidthAtom);
  return leftWidth;
}

export function useRightWidth() {
  const rightWidth = useAtomValue(rightWidthAtom);
  return rightWidth;
}

export function useContentWidth() {
  const contentWidth = useAtomValue(contentWidthAtom);
  return contentWidth;
}

export function useActiveLeftPane() {
  const activeLeftPane = useAtomValue(activeLeftPaneAtom);
  return activeLeftPane;
}

export function useActiveRightPane() {
  const activeRightPane = useAtomValue(activeRightPaneAtom);
  return activeRightPane;
}

export function useLeftRegionActive() {
  const leftRegionActive = useAtomValue(leftRegionActiveAtom);
  return leftRegionActive;
}

export function useRightRegionActive() {
  const rightRegionActive = useAtomValue(rightRegionActiveAtom);
  return rightRegionActive;
}

export function useFooterRegionActive() {
  const footerRegionActive = useAtomValue(footerRegionActiveAtom);
  return footerRegionActive;
}

export function useLeftExpanded() {
  return useAtomValue(leftExpandedAtom);
}

export function useRightExpanded() {
  return useAtomValue(rightExpandedAtom);
}

export function useContentVisible() {
  return useAtomValue(contentVisibleAtom);
}

export function useDesktopState() {
  return useIsDesktop();
}
