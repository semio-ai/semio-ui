import { useMemo, type ReactNode } from "react";
import { Variant } from "../types";
import type { IconValue } from "../icons/registry";

export interface TabChild {
  title: string;
  key: string;
  variant?: Variant;
  icon?: IconValue;
  content: ReactNode;
}

/**
 * Normalises a list of tab children, substituting a placeholder when the list
 * is empty so consumers can always render at least one tab without a special
 * case.
 *
 * @param children - The consumer-provided tabs.
 * @param defaultContent - Body shown for the placeholder when `children` is
 *   empty (defaults to a "No Contents" filler).
 * @param emptyTabText - Title shown for the placeholder (defaults to "No tabs").
 *
 * @returns `{ childrenTabs }` — `children` if non-empty, otherwise an array
 *   containing a single placeholder tab.
 *
 * @example
 * ```tsx
 * const { childrenTabs } = useTabsState(tabs, <div>Default</div>, "No tabs");
 * ```
 */
export function useTabsState(
  children: TabChild[],
  // The `selected` arg used to drive direction tracking for slide animations.
  // The `Tabs` component no longer animates content swap, so this parameter
  // is unused but kept in the signature for backwards compatibility with
  // existing call sites until the next breaking change.
  _selected: string | undefined,
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
              content: defaultContent ?? <div className="h-72 w-full">No Contents</div>,
            },
          ],
    [children, defaultContent, emptyTabText],
  );

  return { childrenTabs };
}
