import { useState, useEffect, useMemo, type ReactNode } from "react";
import { Variant } from "../types";

export interface TabChild {
  title: string;
  key: string;
  variant?: Variant;
  icon?: ReactNode;
  content: ReactNode;
}

/**
 * Hook for managing tabs state including children processing and index tracking for animation direction.
 *
 * This hook processes raw tab children into a normalized format, handles empty state with default content,
 * and tracks tab navigation direction for smooth sliding animations. It maintains previous and current
 * tab indices to determine whether the user is moving forward or backward through the tabs.
 *
 * @param children - Array of tab objects containing key, title, content, and optional icon/variant
 * @param selected - Key of the currently selected tab (undefined will default to first tab)
 * @param defaultContent - Content to display when no tabs are provided (defaults to "No Contents" message)
 * @param emptyTabText - Text to display in the default tab when no tabs are provided (defaults to "No tabs")
 *
 * @returns Object containing:
 *   - childrenTabs: Processed tab children with default content if empty
 *   - currentIndex: Index of the currently selected tab
 *   - previousIndex: Index of the previously selected tab
 *   - isMovingForward: Boolean indicating if navigation is forward (true) or backward (false)
 *
 * @example
 * ```tsx
 * const [selectedTab, setSelectedTab] = useState("tab1");
 * const tabs = [
 *   { key: "tab1", title: "First", content: <div>Content 1</div> },
 *   { key: "tab2", title: "Second", content: <div>Content 2</div> }
 * ];
 *
 * const { childrenTabs, isMovingForward } = useTabsState(
 *   tabs,
 *   selectedTab,
 *   <div>Default content</div>,
 *   "No tabs available"
 * );
 * ```
 */
export function useTabsState(
  children: TabChild[],
  selected: string | undefined,
  defaultContent?: ReactNode,
  emptyTabText?: string,
) {
  const childrenTabs: TabChild[] = useMemo(
    () =>
      children.length > 0
        ? children
        : [
            {
              key: "default",
              title: emptyTabText ?? "No tabs",
              variant: Variant.Default,
              content: defaultContent ?? <div className="w-full h-72">No Contents</div>,
            },
          ],
    [children, defaultContent, emptyTabText],
  );

  const [previousIndex, setPreviousIndex] = useState<number>(0);
  const currentIndex = useMemo(() => {
    const index = childrenTabs.findIndex((tab) => tab.key === selected);
    return index === -1 ? 0 : index;
  }, [childrenTabs, selected]);

  // Track index changes for animation direction
  useEffect(() => {
    setPreviousIndex(currentIndex);
  }, [currentIndex]);

  // Determine animation direction based on index change
  const isMovingForward = currentIndex > previousIndex;

  return {
    childrenTabs,
    currentIndex,
    previousIndex,
    isMovingForward,
  };
}
