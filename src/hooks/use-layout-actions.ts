import { useEffect, useRef, useCallback } from "react";
import { useSetAtom } from "jotai";
import { observe } from "jotai-effect";
import { createPane } from "../functions/create-pane";
import { createActionItem } from "../functions/create-action-item";
import { PaneRegion, PaneSpec, ToolbarItem } from "../types";
import { ActionItem } from "../nested-elements/types";
import {
  menuStateAtom,
  panesAtom,
  toolbarItemsAtom,
  actionItemsAtom,
  homeActionItemAtom,
} from "./layout-atoms";

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
  setPanes: (panes: (PaneSpec | Partial<PaneSpec>)[]) => void;
  removePane: (id: string) => void;
  setToolbarItem: (
    item: Partial<ToolbarItem> & { id: string; type: "toolbar-widget" | "toolbar-spacer" },
  ) => void;
  setToolbarItems: (
    items: (Partial<ToolbarItem> & { id: string; type: "toolbar-widget" | "toolbar-spacer" })[],
  ) => void;
  removeToolbarItem: (id: string) => void;
  setActionItem: (item: ActionItem | (Partial<ActionItem> & { id: string })) => void;
  setActionItems: (panes: (ActionItem | (Partial<ActionItem> & { id: string }))[]) => void;
  removeActionItem: (id: string) => void;
  setHomeActionItem: (item: ActionItem | undefined) => void;
  toggleMenu: () => void;
  togglePaneRegion: (pane: PaneRegion, id: string, preventSameClose?: boolean) => void;
  completePanesClose: () => void;
}

/**
 * Returns {@link LayoutActions}
 */
export function useLayoutActions(): LayoutActions {
  const menuExpandedRef = useRef<boolean>(false);
  const panesRef = useRef<PaneSpec[]>([]);
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
    const panesUnsub = observe((get) => {
      panesRef.current = get(panesAtom);
    });
    const toolbarItemsUnsub = observe((get) => {
      toolbarItemsRef.current = get(toolbarItemsAtom);
    });
    const actionItemsUnsub = observe((get) => {
      actionItemsRef.current = get(actionItemsAtom);
    });
    return () => {
      expandedUnsub();
      panesUnsub();
      toolbarItemsUnsub();
      actionItemsUnsub();
    };
  });

  const setPane = useCallback(
    (pane: PaneSpec | Partial<PaneSpec>) => {
      const existingPane = panesRef.current.find((p) => p.id === pane.id);
      const newPanes = existingPane
        ? panesRef.current.map((p) => (p.id === pane.id ? { ...p, ...pane } : p))
        : [...panesRef.current, { ...createPane(), ...pane }];
      setPanes(newPanes);
    },
    [panesRef, setPanes],
  );

  const setPanesNice = useCallback(
    (panes: (PaneSpec | Partial<PaneSpec>)[]) => {
      panes.forEach(setPane);
    },
    [setPane],
  );

  const removePane = useCallback(
    (id: string) => {
      const newPanes = panesRef.current.filter((p) => p.id !== id);
      setPanes(newPanes);
    },
    [setPanes, panesRef],
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
    ) => {
      items.forEach(setToolbarItem);
    },
    [setToolbarItem],
  );

  const removeToolbarItem = useCallback(
    (id: string) => {
      const newItems = toolbarItemsRef.current.filter((i) => i.id !== id);
      setToolbarItems(newItems);
    },
    [setToolbarItems, toolbarItemsRef],
  );

  const setActionItem = useCallback(
    (item: ActionItem | (Partial<ActionItem> & { id: string })) => {
      const existingItem = actionItemsRef.current.find((a) => a.id === item.id);
      const newItems = existingItem
        ? actionItemsRef.current.map((a) => (a.id === item.id ? { ...a, ...item } : a))
        : [...actionItemsRef.current, { ...createActionItem(), ...item }];
      setActionItems(newItems);
    },
    [setActionItems, actionItemsRef],
  );

  const setActionItemsNice = useCallback(
    (items: (ActionItem | (Partial<ActionItem> & { id: string }))[]) => {
      items.forEach(setActionItem);
    },
    [setActionItem],
  );

  const removeActionItem = useCallback(
    (id: string) => {
      const newItems = actionItemsRef.current.filter((i) => i.id !== id);
      setActionItems(newItems);
    },
    [setActionItems, actionItemsRef],
  );

  const completePanesClose = useCallback(() => {
    const newPanes = panesRef.current.map((p) =>
      p.shouldClose ? { ...p, shouldClose: undefined, region: undefined } : p,
    );
    setPanes(newPanes);
  }, [panesRef, setPanes]);

  const toggleMenu = useCallback(() => {
    setMenuExpanded(!menuExpandedRef.current);
  }, [setMenuExpanded, menuExpandedRef]);

  const togglePaneRegion = useCallback(
    (region: PaneRegion, id: string, preventSameClose = false) => {
      // First, find if the current pane id is currently in that region;
      const currentPaneInRegion = panesRef.current.find((p) => p.id === id && p.region === region);
      // Don't close the pane directly, but set the flag so that it knows it should close
      if (currentPaneInRegion && !preventSameClose) {
        const newPanes = panesRef.current.map((p) =>
          p.id === id ? { ...p, shouldClose: true } : p,
        );
        setPanes(newPanes);
      } else {
        const newPanes = panesRef.current.map((p) =>
          p.id === id
            ? { ...p, region }
            : { ...p, region: p.region === region ? undefined : p.region },
        );
        setPanes(newPanes);
      }
    },
    [panesRef, setPanes],
  );

  return {
    setPane,
    setPanes: setPanesNice,
    removePane,
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
