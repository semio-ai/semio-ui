import { atom, useAtomValue } from "jotai";
import { ActionItem } from "../nested-elements/types";
import { PaneRegion, PaneSpec, ToolbarItem } from "../types";

export const menuStateAtom = atom<boolean>(false);
export const panesAtom = atom<PaneSpec[]>([]);
export const toolbarItemsAtom = atom<ToolbarItem[]>([]);
export const actionItemsAtom = atom<ActionItem[]>([]);
export const homeActionItemAtom = atom<ActionItem | undefined>(undefined);
export const desktopAtom = atom<boolean>(false);

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

export const leftRegionActiveAtom = atom<boolean>((get) => {
  const panes = get(panesAtom);
  return panes.find((p) => p.region === PaneRegion.Left) !== undefined;
});

export const rightRegionActiveAtom = atom<boolean>((get) => {
  const panes = get(panesAtom);
  return panes.find((p) => p.region === PaneRegion.Right) !== undefined;
});

export const footerRegionActiveAtom = atom<boolean>((get) => {
  const panes = get(panesAtom);
  return panes.find((p) => p.region === PaneRegion.Footer) !== undefined;
});

export const leftWidthAtom = atom<string>((get) => {
  const panes = get(panesAtom);
  const left = panes.filter(
    (pane) => pane.region === PaneRegion.Left && pane.content !== undefined,
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
    (pane) => pane.region === PaneRegion.Right && pane.content !== undefined,
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

export function useDesktopState() {
  const desktopState = useAtomValue(desktopAtom);
  return desktopState;
}
