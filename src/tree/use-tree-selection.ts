import { useCallback, useMemo, useState } from "react";

/**
 * Selection controller for a hierarchical row list. Operates on node ids and
 * resolves the three canonical gestures (replace / toggle / range) against the
 * visible order, an anchor, and an optional hierarchy policy.
 *
 * It is controlled or uncontrolled, mirroring {@link useCollapsibleTree}:
 * - Controlled: pass `selected` + `onSelectionChange`; the consumer's store
 *   stays authoritative (e.g. the animation editor keeps selection in zustand
 *   and simply mirrors it here).
 * - Uncontrolled: pass `defaultSelected` (or nothing) and the hook owns the set
 *   (e.g. the live-data table).
 *
 * The unit is the node id. A consumer whose domain selection is keyed on
 * something else (animation selects by trackId) maps node → domain in its
 * `onSelectionChange` handler — the same translation `selectTrack(rowId,
 * trackIds)` already performs.
 */

export type SelectionGesture = "replace" | "toggle" | "range";

export interface SelectionModifiers {
  /** Ctrl/Cmd — toggle the target in/out of the selection. */
  toggle?: boolean;
  /** Shift — extend from the anchor to the target. */
  range?: boolean;
}

/** Map pointer/keyboard modifiers to a gesture. Range wins over toggle. */
export function resolveGesture(modifiers: SelectionModifiers): SelectionGesture {
  if (modifiers.range) return "range";
  if (modifiers.toggle) return "toggle";
  return "replace";
}

/**
 * Ids from `aId` to `bId` inclusive in `order`, regardless of direction. If the
 * anchor is missing, falls back to just the target.
 */
export function idsInRange(order: string[], aId: string, bId: string): string[] {
  const a = order.indexOf(aId);
  const b = order.indexOf(bId);
  if (b === -1) return [];
  if (a === -1) return [bId];
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return order.slice(lo, hi + 1);
}

export interface SelectionState {
  selected: Set<string>;
  anchorId: string | null;
}

export interface ApplySelectionParams {
  order: string[];
  /** Expand a node to itself plus any descendants (group propagation). */
  expand: (id: string) => string[];
  /** Scope key of a node, for the hierarchy-scope policy. */
  scopeOf?: (id: string) => string | undefined;
}

export interface ApplySelectionResult extends SelectionState {
  /** True when the gesture moved selection into a different scope. */
  scopeChanged: boolean;
  /** The scope the selection now sits in (only meaningful with `scopeOf`). */
  scope: string | undefined;
}

/**
 * Pure gesture resolver — the whole state machine, no React. Given the current
 * selection/anchor and a target + modifiers, returns the next selection/anchor
 * and whether the scope changed. Exported for testing and reuse.
 */
export function applySelection(
  state: SelectionState,
  id: string,
  modifiers: SelectionModifiers,
  params: ApplySelectionParams,
): ApplySelectionResult {
  const { order, expand, scopeOf } = params;
  const gesture = resolveGesture(modifiers);
  const scope = scopeOf?.(id);

  // Scope gate: a target in a new scope always resets selection into that
  // scope, regardless of the gesture.
  const scopeChanged =
    scopeOf !== undefined && state.anchorId !== null && scopeOf(state.anchorId) !== scope;
  if (scopeChanged) {
    return { selected: new Set(expand(id)), anchorId: id, scopeChanged: true, scope };
  }

  if (gesture === "range" && state.anchorId) {
    const next = new Set(state.selected);
    for (const rangeId of idsInRange(order, state.anchorId, id)) {
      for (const e of expand(rangeId)) next.add(e);
    }
    // anchor is preserved across a range extend
    return { selected: next, anchorId: state.anchorId, scopeChanged: false, scope };
  }

  if (gesture === "toggle") {
    const next = new Set(state.selected);
    const removing = next.has(id);
    for (const e of expand(id)) {
      if (removing) next.delete(e);
      else next.add(e);
    }
    return { selected: next, anchorId: id, scopeChanged: false, scope };
  }

  // replace (also the fallback when a range has no anchor)
  return { selected: new Set(expand(id)), anchorId: id, scopeChanged: false, scope };
}

export interface UseTreeSelectionOptions {
  /** Visible node ids in display order (from `flattenTree`); range walks this. */
  order: string[];
  /** Controlled selected-id set. When provided, the hook never owns state. */
  selected?: Iterable<string>;
  /** Initial selection for the uncontrolled case. */
  defaultSelected?: Iterable<string>;
  /** Notified with the next selection whenever it changes (both modes). */
  onSelectionChange?: (next: Set<string>) => void;
  /**
   * Hierarchy policy — the scope a node belongs to (e.g. its instance id).
   * When a gesture targets a node in a different scope than the current
   * selection, selection resets into the new scope and {@link onScopeChange}
   * fires. Generalizes the animation editor's `focusSelectionInstance`.
   */
  scopeOf?: (id: string) => string | undefined;
  /** Fires when a gesture moves selection into a different scope. */
  onScopeChange?: (scope: string | undefined) => void;
  /** Hierarchy policy — descendant ids of a group node. When provided,
   *  selecting/toggling a group includes its descendants. */
  getDescendants?: (id: string) => string[];
}

export interface TreeSelection {
  /** Current selected-id set (referentially stable between changes). */
  selected: Set<string>;
  /** The current range anchor, or null. */
  anchorId: string | null;
  isSelected: (id: string) => boolean;
  /** Apply a gesture (default "replace") to `id`. */
  select: (id: string, modifiers?: SelectionModifiers) => void;
  /** Clear the whole selection. */
  clear: () => void;
}

export function useTreeSelection(options: UseTreeSelectionOptions): TreeSelection {
  const {
    order,
    selected: controlled,
    defaultSelected,
    onSelectionChange,
    scopeOf,
    onScopeChange,
    getDescendants,
  } = options;

  const [uncontrolled, setUncontrolled] = useState<Set<string>>(
    () => new Set(defaultSelected ?? []),
  );
  const [anchorId, setAnchorId] = useState<string | null>(null);

  const isControlled = controlled !== undefined;
  const selected = useMemo(
    () => (isControlled ? new Set(controlled) : uncontrolled),
    [isControlled, controlled, uncontrolled],
  );

  const expand = useCallback(
    (id: string): string[] => (getDescendants ? [id, ...getDescendants(id)] : [id]),
    [getDescendants],
  );

  const select = useCallback(
    (id: string, modifiers: SelectionModifiers = {}) => {
      const result = applySelection({ selected, anchorId }, id, modifiers, {
        order,
        expand,
        scopeOf,
      });
      if (result.scopeChanged) onScopeChange?.(result.scope);
      if (!isControlled) setUncontrolled(result.selected);
      setAnchorId(result.anchorId);
      onSelectionChange?.(result.selected);
    },
    [anchorId, expand, isControlled, onScopeChange, onSelectionChange, order, scopeOf, selected],
  );

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);
  const clear = useCallback(() => {
    if (!isControlled) setUncontrolled(new Set());
    setAnchorId(null);
    onSelectionChange?.(new Set());
  }, [isControlled, onSelectionChange]);

  return { selected, anchorId, isSelected, select, clear };
}
