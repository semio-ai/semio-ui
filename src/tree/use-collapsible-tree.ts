import { useCallback, useMemo, useState } from "react";

/**
 * Collapse-state management for a hierarchical row list. Tracks the set of
 * collapsed group ids (collapse is the exception; everything is expanded by
 * default), and works both controlled and uncontrolled.
 *
 * The state is keyed on *collapsed* ids to match how the live-data table
 * persists its layout. Consumers that think in terms of *expanded* ids (e.g.
 * the animation control list's `expandedGroups`) simply invert at the call
 * site — `isCollapsed(id) === !expanded[id]`.
 */
export interface UseCollapsibleTreeOptions {
  /** Controlled collapsed-id set. When provided, the hook never owns state. */
  collapsed?: Iterable<string>;
  /** Initial collapsed ids for the uncontrolled case. */
  defaultCollapsed?: Iterable<string>;
  /** Notified whenever the collapsed set changes (both modes). */
  onCollapsedChange?: (next: Set<string>) => void;
}

export interface CollapsibleTree {
  /** The current collapsed-id set (referentially stable between changes). */
  collapsed: Set<string>;
  /** Whether a given group id is currently collapsed. */
  isCollapsed: (id: string) => boolean;
  /** Flip the collapsed state of one group id. */
  toggle: (id: string) => void;
  /** Explicitly set a group id collapsed or expanded. */
  setCollapsed: (id: string, collapsed: boolean) => void;
  /** Replace the whole collapsed set. */
  replace: (next: Iterable<string>) => void;
}

/** Pure helper: return a new set with `id` flipped. Exported for testing. */
export function toggleInSet(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

/** Pure helper: return a new set with `id` present or absent. */
export function withMembership(set: Set<string>, id: string, present: boolean): Set<string> {
  if (present === set.has(id)) return set;
  const next = new Set(set);
  if (present) {
    next.add(id);
  } else {
    next.delete(id);
  }
  return next;
}

export function useCollapsibleTree(options: UseCollapsibleTreeOptions = {}): CollapsibleTree {
  const { collapsed: controlled, defaultCollapsed, onCollapsedChange } = options;

  const [uncontrolled, setUncontrolled] = useState<Set<string>>(
    () => new Set(defaultCollapsed ?? []),
  );

  const isControlled = controlled !== undefined;
  const collapsed = useMemo(
    () => (isControlled ? new Set(controlled) : uncontrolled),
    [isControlled, controlled, uncontrolled],
  );

  const commit = useCallback(
    (next: Set<string>) => {
      if (!isControlled) setUncontrolled(next);
      onCollapsedChange?.(next);
    },
    [isControlled, onCollapsedChange],
  );

  const isCollapsed = useCallback((id: string) => collapsed.has(id), [collapsed]);
  const toggle = useCallback((id: string) => commit(toggleInSet(collapsed, id)), [collapsed, commit]);
  const setCollapsed = useCallback(
    (id: string, value: boolean) => commit(withMembership(collapsed, id, value)),
    [collapsed, commit],
  );
  const replace = useCallback((next: Iterable<string>) => commit(new Set(next)), [commit]);

  return { collapsed, isCollapsed, toggle, setCollapsed, replace };
}
