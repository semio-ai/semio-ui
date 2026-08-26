import { useEffect, useRef, useCallback } from "react";
import { useSetAtom } from "jotai";
import { observe } from "jotai-effect";
import { createPane } from "../functions/create-pane";
import { createActionItem } from "../functions/create-action-item";
import { PaneRegion, PaneSpec, ToolbarItem } from "../types";
import { ActionItem, ActionItemPlaceholder, isPlaceholder } from "../layouts/layout/types";
import {
  menuStateAtom,
  panesAtom,
  toolbarItemsAtom,
  actionItemsAtom,
  homeActionItemAtom,
} from "./layout-atoms";
import { useIsDesktop } from "./use-is-desktop";

/**
 * Whether an open side pane has another open side pane on top of it — i.e. a pane
 * with a higher `openOrder`. Only meaningful where the side regions share a row;
 * above the breakpoint they have a track each and nothing covers anything.
 */
function isCovered(panes: PaneSpec[], id: string): boolean {
  const order = panes.find((p) => p.id === id)?.openOrder;
  if (order === undefined) return false;
  return panes.some(
    (other) =>
      other.id !== id &&
      other.content !== undefined &&
      !other.shouldClose &&
      other.openOrder !== undefined &&
      other.openOrder > order,
  );
}

export type ActionItemInput =
  | ActionItem // Full menu item
  | ActionItemPlaceholder // Just { id, type: "placeholder" }
  | (Partial<ActionItem> & { id: string }); // Partial item with required id

/**
 * LayoutActions interface defines the actions that can be performed on the layout.
 * @param setPane - Function to set a single pane's data.
 * @param setPanes - Function to set multiple panes' data.
 * @param removePane - Function to remove a single pane.
 * @param setToolbarItem - Function to set a single toolbar item.
 * @param setToolbarItems - Function to set multiple toolbar items.
 * @param removeToolbarItem - Function to remove a single toolbar item.
 * @param setActionItem - Function to set a single action item.
 * @param setActionItems - Function to set multiple action items.
 * @param removeActionItem - Function to remove a single action item.
 * @param setHomeActionItem - Function to set the home action item.
 * @param toggleMenu - Function to toggle the menu's width.
 * @param togglePaneRegion - Function to toggle a pane region.
 * @param completePanesClose - [INTERNAL ONLY] Function to complete the panes close.
 */
export interface LayoutActions {
  setPane: (pane: PaneSpec | Partial<PaneSpec>) => void;
  setPanes: (panes: (PaneSpec | Partial<PaneSpec>)[], replace?: boolean) => void;
  removePane: (id: string) => void;
  removePanes: (ids: string[]) => void;
  setToolbarItem: (
    item: Partial<ToolbarItem> & { id: string; type: "toolbar-widget" | "toolbar-spacer" },
  ) => void;
  setToolbarItems: (
    items: (Partial<ToolbarItem> & { id: string; type: "toolbar-widget" | "toolbar-spacer" })[],
    replace?: boolean,
  ) => void;
  removeToolbarItem: (id: string) => void;
  setActionItem: (item: ActionItemInput, index?: number) => void;
  setActionItems: (panes: ActionItemInput[], replace?: boolean) => void;
  removeActionItem: (id: string) => void;
  setHomeActionItem: (item: ActionItem | undefined) => void;
  toggleMenu: () => void;
  togglePaneRegion: (pane: PaneRegion, id: string, preventSameClose?: boolean) => void;
  completePanesClose: () => void;
}

/**
 * Merge one spec into the pane set by id, creating it from {@link createPane}
 * defaults when absent.
 *
 * Pure and taking the set as its first argument so it composes: a batch is
 * `panes.reduce(mergePane, current)`, one fold producing one write, rather than
 * a write per pane each rebuilding from the same stale starting point.
 */
function mergePane(panes: PaneSpec[], pane: PaneSpec | Partial<PaneSpec>): PaneSpec[] {
  return panes.some((p) => p.id === pane.id)
    ? panes.map((p) => (p.id === pane.id ? { ...p, ...pane } : p))
    : [...panes, { ...createPane(), ...pane }];
}

/**
 * Returns {@link LayoutActions}
 */
export function useLayoutActions(): LayoutActions {
  const menuExpandedRef = useRef<boolean>(false);
  // Mirrored into a ref rather than closed over, so `togglePaneRegion` keeps a
  // stable identity across the breakpoint — consumers list it in effect and memo
  // dependencies.
  const desktop = useIsDesktop();
  const desktopRef = useRef(desktop);
  desktopRef.current = desktop;
  const toolbarItemsRef = useRef<ToolbarItem[]>([]);
  const actionItemsRef = useRef<ActionItem[]>([]);
  const setMenuExpanded = useSetAtom(menuStateAtom);
  const setPanes = useSetAtom(panesAtom);
  const setToolbarItems = useSetAtom(toolbarItemsAtom);
  const setActionItems = useSetAtom(actionItemsAtom);
  const setHomeActionItem = useSetAtom(homeActionItemAtom);

  useEffect(() => {
    const expandedUnsub = observe((get) => {
      menuExpandedRef.current = get(menuStateAtom);
    });
    const toolbarItemsUnsub = observe((get) => {
      toolbarItemsRef.current = get(toolbarItemsAtom);
    });
    const actionItemsUnsub = observe((get) => {
      actionItemsRef.current = get(actionItemsAtom);
    });
    return () => {
      expandedUnsub();
      toolbarItemsUnsub();
      actionItemsUnsub();
    };
  });
  const setPane = useCallback(
    (pane: PaneSpec | Partial<PaneSpec>) => {
      setPanes((current) => mergePane(current, pane));
    },
    [setPanes],
  );

  const setPanesNice = useCallback(
    (panes: (PaneSpec | Partial<PaneSpec>)[], replace?: boolean) => {
      if (replace) {
        setPanes(panes.map((pane) => ({ ...createPane(), ...pane })));
        return;
      }
      // ONE write folding every update, rather than a `setPane` per item.
      //
      // Per-item was not observably broken — each write resolved against the atom's
      // current value, so a batch dispatched from one handler did land in full. It
      // was, though, N renders for one intent, and every item rebuilt from a ref
      // mirroring the atom through a subscription, which is a shape that only stays
      // correct while nothing reads the ref across a boundary the subscription has
      // not caught up over. The studio hit exactly that and documents it in
      // `use-selection-pane`. Folding removes the class rather than the instance:
      // there is no snapshot to be stale because there is no snapshot.
      setPanes((current) => panes.reduce(mergePane, current));
    },
    [setPanes],
  );

  const removePane = useCallback(
    (id: string) => {
      setPanes((current) => current.filter((p) => p.id !== id));
    },
    [setPanes],
  );

  const removePanes = useCallback(
    (ids: string[]) => {
      setPanes((current) => current.filter((p) => !ids.includes(p.id)));
    },
    [setPanes],
  );

  const setToolbarItem = useCallback(
    (item: Partial<ToolbarItem> & { id: string; type: "toolbar-widget" | "toolbar-spacer" }) => {
      const existingItem = toolbarItemsRef.current.find((i) => i.id === item.id);
      if (existingItem) {
        const newItems: ToolbarItem[] = toolbarItemsRef.current.map((i) =>
          i.id === item.id && item.type === i.type ? { ...i, ...item } : (i as ToolbarItem),
        ) as ToolbarItem[];
        setToolbarItems(newItems);
      } else if (item.type === "toolbar-spacer") {
        setToolbarItems([...toolbarItemsRef.current, { ...item }]);
      } else if (item.type === "toolbar-widget") {
        setToolbarItems([...toolbarItemsRef.current, { component: null, ...item }]);
      }
    },
    [setToolbarItems, toolbarItemsRef],
  );

  const setToolbarItemsNice = useCallback(
    (
      items: (Partial<ToolbarItem> & { id: string; type: "toolbar-widget" | "toolbar-spacer" })[],
      replace?: boolean,
    ) => {
      if (replace) {
        setToolbarItems(
          items.map((item) =>
            item.type === "toolbar-spacer" ? item : { component: null, ...item },
          ),
        );
      } else {
        items.forEach(setToolbarItem);
      }
    },
    [setToolbarItems, setToolbarItem],
  );

  const removeToolbarItem = useCallback(
    (id: string) => {
      const newItems = toolbarItemsRef.current.filter((i) => i.id !== id);
      setToolbarItems(newItems);
    },
    [setToolbarItems, toolbarItemsRef],
  );

  const setActionItem = useCallback(
    (item: ActionItemInput, index?: number) => {
      const existingItem = actionItemsRef.current.find((a) => a.id === item.id);
      // If the item is a placeholder, do nothing;
      if (!isPlaceholder(item)) {
        const newItems: ActionItem[] = existingItem
          ? actionItemsRef.current.map((a) => (a.id === item.id ? { ...a, ...item } : a))
          : (() => {
              const newItem: ActionItem = { ...createActionItem(), ...item } as ActionItem;
              const items: ActionItem[] = [...actionItemsRef.current];
              if (index !== undefined && index >= 0 && index <= items.length) {
                items.splice(index, 0, newItem);
                return items;
              } else {
                return [...items, newItem];
              }
            })();
        setActionItems(newItems);
      }
    },
    [setActionItems, actionItemsRef],
  );

  const setActionItemsNice = useCallback(
    (items: ActionItemInput[], replace?: boolean) => {
      if (replace) {
        setActionItems(
          items.map(
            (item) =>
              (isPlaceholder(item) ? item : { ...createActionItem(), ...item }) as ActionItem,
          ),
        );
      } else {
        items.forEach((item, index) => setActionItem(item, index));
      }
    },
    [setActionItem, setActionItems],
  );

  const removeActionItem = useCallback(
    (id: string) => {
      const newItems = actionItemsRef.current.filter((i) => i.id !== id);
      setActionItems(newItems);
    },
    [setActionItems, actionItemsRef],
  );

  const completePanesClose = useCallback(() => {
    setPanes((current) =>
      current.map((p) => (p.shouldClose ? { ...p, shouldClose: undefined, region: undefined } : p)),
    );
  }, [setPanes]);

  const toggleMenu = useCallback(() => {
    setMenuExpanded(!menuExpandedRef.current);
  }, [setMenuExpanded, menuExpandedRef]);

  const togglePaneRegion = useCallback(
    (region: PaneRegion, id: string, preventSameClose = false) => {
      setPanes((current) => {
        // First, find if the current pane id is currently in that region;
        const currentPaneInRegion = current.find((p) => p.id === id && p.region === region);

        // Open, but covered by a side pane opened more recently. Below the breakpoint
        // the side regions share one row and only the newest is shown, so toggling
        // this one means "show me this", not "close this": closing a pane the viewer
        // cannot see changes nothing on screen, which reads as a dead button and takes
        // two presses to get the pane they asked for.
        //
        // Expressed by clearing `openOrder` while leaving the region set — `panesAtom`
        // re-stamps it as the most recently opened. Gated on the breakpoint because
        // above it the regions have a track each and both are already visible, where
        // the toggle has to keep closing.
        if (!desktopRef.current && currentPaneInRegion && isCovered(current, id)) {
          return current.map((p) => (p.id === id ? { ...p, openOrder: undefined } : p));
        }

        // Don't close the pane directly, but set the flag so that it knows it should close
        if (currentPaneInRegion && !preventSameClose) {
          return current.map((p) =>
            // If the pane has content, set it to close. Otherwise, set the region to undefined directly
            p.id === id
              ? {
                  ...p,
                  shouldClose: p.content !== undefined,
                  region: p.content ? p.region : undefined,
                }
              : p,
          );
        }
        if (!currentPaneInRegion) {
          return current.map((p) =>
            p.id === id
              ? { ...p, region }
              : { ...p, region: p.region === region ? undefined : p.region },
          );
        }
        // Already in the region and asked not to close: returning the input is the
        // no-op `panesAtom` short-circuits on.
        return current;
      });
    },
    [setPanes],
  );

  return {
    setPane,
    setPanes: setPanesNice,
    removePane,
    removePanes,
    setToolbarItem,
    setToolbarItems: setToolbarItemsNice,
    removeToolbarItem,
    setActionItem,
    setActionItems: setActionItemsNice,
    removeActionItem,
    setHomeActionItem,
    toggleMenu,
    togglePaneRegion,
    completePanesClose,
  };
}
