import { useState, useCallback, useMemo, useRef, useEffect } from "react";

export type SelectionMode = "none" | "single" | "multiple";
export type SelectionBehavior = "toggle" | "replace";

export interface TableListItem {
  key: string;
  disabled?: boolean;
}

export interface UseTableListStateOptions<T extends TableListItem> {
  // Data
  items: T[];
  getSearchText?: (item: T) => string;

  // Selection configuration
  selectionMode?: SelectionMode;
  selectionBehavior?: SelectionBehavior;

  // Selection state (controlled)
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;

  // Selection state (uncontrolled)
  defaultSelectedKeys?: Set<string>;

  // Focus state
  focusedKey?: string | null;
  onFocusChange?: (key: string | null) => void;
  defaultFocusedKey?: string | null;

  // Selection constraints
  disallowEmptySelection?: boolean;

  // Navigation options
  allowTypeAhead?: boolean;
  allowWrapNavigation?: boolean;

  // Event handlers
  onAction?: (key: string, event: KeyboardEvent | MouseEvent) => void;
  onKeyDown?: (key: string, event: KeyboardEvent) => void;
}

export interface TableListState<T extends TableListItem> {
  // Data access
  items: T[];
  getItem: (key: string) => T | undefined;
  getItemIndex: (key: string) => number;

  // Selection state
  selectedKeys: Set<string>;
  selectionMode: SelectionMode;
  selectionBehavior: SelectionBehavior;

  // Focus state
  focusedKey: string | null;

  // State queries
  isSelected: (key: string) => boolean;
  isFocused: (key: string) => boolean;
  isDisabled: (key: string) => boolean;

  // Selection actions
  select: (key: string) => void;
  deselect: (key: string) => void;
  toggle: (key: string) => void;
  selectRange: (fromKey: string, toKey: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Focus actions
  setFocusedKey: (key: string | null) => void;
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;

  // Event handlers
  handleItemClick: (key: string, event: MouseEvent) => void;
  handleItemKeyDown: (key: string, event: KeyboardEvent) => void;
  handleItemFocus: (key: string) => void;
  handleItemBlur: () => void;

  // Utility
  getNavigationProps: () => Record<string, any>;
  getItemProps: (key: string) => Record<string, any>;
}

export function useTableListState<T extends TableListItem>({
  items,
  getSearchText,
  selectionMode = "none",
  selectionBehavior = "toggle",
  selectedKeys: controlledSelectedKeys,
  onSelectionChange,
  defaultSelectedKeys = new Set(),
  focusedKey: controlledFocusedKey,
  onFocusChange,
  defaultFocusedKey = null,
  disallowEmptySelection = false,
  allowTypeAhead = true,
  allowWrapNavigation = true,
  onAction,
  onKeyDown,
}: UseTableListStateOptions<T>): TableListState<T> {
  // Internal state for uncontrolled mode
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] = useState(defaultSelectedKeys);
  const [uncontrolledFocusedKey, setUncontrolledFocusedKey] = useState(defaultFocusedKey);
  const [lastInteractionKey, setLastInteractionKey] = useState<string | null>(null);

  // Type-ahead state
  const [typeAheadQuery, setTypeAheadQuery] = useState("");
  const typeAheadTimeoutRef = useRef<NodeJS.Timeout>();

  // Determine controlled vs uncontrolled
  const isControlledSelection = controlledSelectedKeys !== undefined;
  const isControlledFocus = controlledFocusedKey !== undefined;

  const selectedKeys = isControlledSelection ? controlledSelectedKeys : uncontrolledSelectedKeys;
  const focusedKey = isControlledFocus ? controlledFocusedKey : uncontrolledFocusedKey;

  // Memoized item lookups
  const itemMap = useMemo(() => {
    const map = new Map<string, T>();
    items.forEach((item) => {
      map.set(item.key, item);
    });
    return map;
  }, [items]);

  const itemKeys = useMemo(() => items.map((item) => item.key), [items]);

  const enabledKeys = useMemo(() => {
    return items.filter((item) => !item.disabled).map((item) => item.key);
  }, [items]);

  // Update selection state
  const updateSelection = useCallback(
    (newKeys: Set<string>) => {
      if (!isControlledSelection) {
        setUncontrolledSelectedKeys(newKeys);
      }
      onSelectionChange?.(newKeys);
    },
    [isControlledSelection, onSelectionChange],
  );

  // Update focus state
  const updateFocus = useCallback(
    (key: string | null) => {
      if (!isControlledFocus) {
        setUncontrolledFocusedKey(key);
      }
      onFocusChange?.(key);
    },
    [isControlledFocus, onFocusChange],
  );

  // State queries
  const isSelected = useCallback((key: string) => selectedKeys.has(key), [selectedKeys]);
  const isFocused = useCallback((key: string) => focusedKey === key, [focusedKey]);
  const isDisabled = useCallback(
    (key: string) => {
      const item = itemMap.get(key);
      return item?.disabled ?? false;
    },
    [itemMap],
  );

  // Navigation helpers
  const getNextKey = useCallback(
    (currentKey: string) => {
      const currentIndex = enabledKeys.indexOf(currentKey);
      if (currentIndex === -1) return null;

      const nextIndex = currentIndex + 1;
      if (nextIndex >= enabledKeys.length) {
        return allowWrapNavigation ? enabledKeys[0] : null;
      }
      return enabledKeys[nextIndex];
    },
    [enabledKeys, allowWrapNavigation],
  );

  const getPreviousKey = useCallback(
    (currentKey: string) => {
      const currentIndex = enabledKeys.indexOf(currentKey);
      if (currentIndex === -1) return null;

      const prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        return allowWrapNavigation ? enabledKeys[enabledKeys.length - 1] : null;
      }
      return enabledKeys[prevIndex];
    },
    [enabledKeys, allowWrapNavigation],
  );

  // Selection actions
  const select = useCallback(
    (key: string) => {
      if (isDisabled(key) || selectionMode === "none") return;

      let newKeys: Set<string>;
      if (selectionMode === "single") {
        newKeys = new Set([key]);
      } else {
        newKeys = new Set([...selectedKeys, key]);
      }

      updateSelection(newKeys);
      setLastInteractionKey(key);
    },
    [isDisabled, selectionMode, selectedKeys, updateSelection],
  );

  const deselect = useCallback(
    (key: string) => {
      if (isDisabled(key) || selectionMode === "none") return;
      if (disallowEmptySelection && selectedKeys.size <= 1 && selectedKeys.has(key)) return;

      const newKeys = new Set(selectedKeys);
      newKeys.delete(key);
      updateSelection(newKeys);
    },
    [isDisabled, selectionMode, selectedKeys, updateSelection, disallowEmptySelection],
  );

  const toggle = useCallback(
    (key: string) => {
      if (isSelected(key)) {
        deselect(key);
      } else {
        select(key);
      }
    },
    [isSelected, select, deselect],
  );

  const selectRange = useCallback(
    (fromKey: string, toKey: string) => {
      if (selectionMode !== "multiple") return;

      const fromIndex = enabledKeys.indexOf(fromKey);
      const toIndex = enabledKeys.indexOf(toKey);
      if (fromIndex === -1 || toIndex === -1) return;

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      const rangeKeys = enabledKeys.slice(start, end + 1);

      const newKeys = new Set([...selectedKeys, ...rangeKeys]);
      updateSelection(newKeys);
      setLastInteractionKey(toKey);
    },
    [selectionMode, enabledKeys, selectedKeys, updateSelection],
  );

  const selectAll = useCallback(() => {
    if (selectionMode !== "multiple") return;
    updateSelection(new Set(enabledKeys));
  }, [selectionMode, enabledKeys, updateSelection]);

  const clearSelection = useCallback(() => {
    if (disallowEmptySelection) return;
    updateSelection(new Set());
  }, [updateSelection, disallowEmptySelection]);

  // Focus actions
  const setFocusedKey = useCallback(
    (key: string | null) => {
      if (key && isDisabled(key)) return;
      updateFocus(key);
    },
    [isDisabled, updateFocus],
  );

  const focusNext = useCallback(() => {
    if (!focusedKey) {
      const firstKey = enabledKeys[0];
      firstKey && setFocusedKey(firstKey);
      return;
    }

    const nextKey = getNextKey(focusedKey);
    nextKey && setFocusedKey(nextKey);
  }, [focusedKey, enabledKeys, getNextKey, setFocusedKey]);

  const focusPrevious = useCallback(() => {
    if (!focusedKey) {
      const lastKey = enabledKeys[enabledKeys.length - 1];
      lastKey && setFocusedKey(lastKey);
      return;
    }

    const prevKey = getPreviousKey(focusedKey);
    prevKey && setFocusedKey(prevKey);
  }, [focusedKey, enabledKeys, getPreviousKey, setFocusedKey]);

  const focusFirst = useCallback(() => {
    const firstKey = enabledKeys[0];
    firstKey && setFocusedKey(firstKey);
  }, [enabledKeys, setFocusedKey]);

  const focusLast = useCallback(() => {
    const lastKey = enabledKeys[enabledKeys.length - 1];
    lastKey && setFocusedKey(lastKey);
  }, [enabledKeys, setFocusedKey]);

  // Type-ahead search
  const performTypeAhead = useCallback(
    (char: string) => {
      if (!allowTypeAhead) return;

      const newQuery = typeAheadQuery + char.toLowerCase();
      setTypeAheadQuery(newQuery);

      // Find matching item
      const matchingKey = enabledKeys.find((key) => {
        const item = itemMap.get(key);
        if (!item) return false;

        // Use custom search text function if provided, otherwise fall back to item.key
        const text = getSearchText ? getSearchText(item) : item.key;
        return text.toLowerCase().startsWith(newQuery);
      });

      if (!matchingKey) {
        // Clear type-ahead after delay
        if (typeAheadTimeoutRef.current) {
          clearTimeout(typeAheadTimeoutRef.current);
        }
        typeAheadTimeoutRef.current = setTimeout(() => {
          setTypeAheadQuery("");
        }, 1000);
        return;
      }

      setFocusedKey(matchingKey);

      // Clear type-ahead after delay
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current);
      }
      typeAheadTimeoutRef.current = setTimeout(() => {
        setTypeAheadQuery("");
      }, 1000);
    },
    [allowTypeAhead, typeAheadQuery, enabledKeys, itemMap, getSearchText, setFocusedKey],
  );

  // Mouse click handler
  const handleItemClick = useCallback(
    (key: string, event: MouseEvent) => {
      if (isDisabled(key)) return;

      // Update focus
      setFocusedKey(key);

      // Handle selection based on mode and modifiers
      if (selectionMode === "none") {
        onAction?.(key, event);
        return;
      }

      if (selectionMode === "single") {
        if (selectionBehavior === "toggle" && isSelected(key)) {
          deselect(key);
        } else {
          select(key);
        }
        return;
      }

      // Multi-select mode
      if (selectionBehavior === "toggle") {
        if (event.shiftKey && lastInteractionKey) {
          selectRange(lastInteractionKey, key);
        } else if (event.ctrlKey || event.metaKey) {
          toggle(key);
        } else {
          toggle(key);
        }
      } else if (event.ctrlKey || event.metaKey) {
        toggle(key);
      } else if (event.shiftKey && lastInteractionKey) {
        selectRange(lastInteractionKey, key);
      } else {
        updateSelection(new Set([key]));
        setLastInteractionKey(key);
      }
    },
    [
      isDisabled,
      setFocusedKey,
      selectionMode,
      selectionBehavior,
      isSelected,
      select,
      deselect,
      toggle,
      selectRange,
      lastInteractionKey,
      updateSelection,
      onAction,
    ],
  );

  // Keyboard handler
  const handleItemKeyDown = useCallback(
    (key: string, event: KeyboardEvent) => {
      if (isDisabled(key)) return;

      // Call custom keydown handler first
      onKeyDown?.(key, event);
      console.log("focus/key", focusedKey, key, event.key, event);

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          if (event.shiftKey && selectionMode === "multiple" && selectionBehavior === "replace") {
            const nextKey = getNextKey(key);
            if (!nextKey) return;
            selectRange(key, nextKey);
            setFocusedKey(nextKey);
          } else {
            focusNext();
          }
          break;

        case "ArrowUp":
          event.preventDefault();
          if (event.shiftKey && selectionMode === "multiple" && selectionBehavior === "replace") {
            const prevKey = getPreviousKey(key);
            if (!prevKey) return;
            selectRange(key, prevKey);
            setFocusedKey(prevKey);
          } else {
            focusPrevious();
          }
          break;

        case "Home":
          event.preventDefault();
          if (event.shiftKey && selectionMode === "multiple" && selectionBehavior === "replace") {
            const firstKey = enabledKeys[0];
            if (!firstKey) return;
            selectRange(key, firstKey);
            setFocusedKey(firstKey);
          } else {
            focusFirst();
          }
          break;

        case "End":
          event.preventDefault();
          if (event.shiftKey && selectionMode === "multiple" && selectionBehavior === "replace") {
            const lastKey = enabledKeys[enabledKeys.length - 1];
            if (!lastKey) return;
            selectRange(key, lastKey);
            setFocusedKey(lastKey);
          } else {
            focusLast();
          }
          break;

        case " ":
        case "Enter":
          event.preventDefault();
          if (selectionMode === "none") {
            onAction?.(key, event);
          } else if (selectionMode === "single") {
            toggle(key);
          } else if (selectionBehavior === "toggle") {
            toggle(key);
          } else if (event.key === " ") {
            toggle(key);
          } else {
            onAction?.(key, event);
          }
          break;

        case "a":
          if (!(event.ctrlKey || event.metaKey) || selectionMode !== "multiple") {
            break;
          }
          event.preventDefault();
          selectAll();
          break;

        case "Escape":
          event.preventDefault();
          clearSelection();
          break;

        default:
          // Type-ahead
          event.key.length === 1 &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            performTypeAhead(event.key);
          break;
      }
    },
    [
      isDisabled,
      onKeyDown,
      selectionMode,
      selectionBehavior,
      getNextKey,
      getPreviousKey,
      focusNext,
      focusPrevious,
      focusFirst,
      focusLast,
      selectRange,
      setFocusedKey,
      enabledKeys,
      toggle,
      selectAll,
      clearSelection,
      performTypeAhead,
      onAction,
      focusedKey,
    ],
  );

  // Focus event handlers
  const handleItemFocus = useCallback(
    (key: string) => {
      setFocusedKey(key);
    },
    [setFocusedKey],
  );

  const handleItemBlur = useCallback(() => {
    // Could implement blur delay logic here if needed
  }, []);

  // Utility functions
  const getItem = useCallback((key: string) => itemMap.get(key), [itemMap]);
  const getItemIndex = useCallback((key: string) => itemKeys.indexOf(key), [itemKeys]);

  const getNavigationProps = useCallback(
    () => ({
      role: selectionMode === "none" ? "grid" : "listbox",
      "aria-multiselectable": selectionMode === "multiple",
      "aria-label": selectionMode !== "none" ? `List with ${selectionMode} selection` : "List",
    }),
    [selectionMode],
  );

  const getItemProps = useCallback(
    (key: string) => ({
      role: selectionMode === "none" ? "gridcell" : "option",
      "aria-selected": selectionMode !== "none" ? isSelected(key) : undefined,
      "aria-disabled": isDisabled(key),
      tabIndex: isFocused(key) ? 0 : -1,
      onClick: (event: MouseEvent) => handleItemClick(key, event),
      onKeyDown: (event: KeyboardEvent) => handleItemKeyDown(key, event),
      onFocus: () => handleItemFocus(key),
      onBlur: handleItemBlur,
    }),
    [
      selectionMode,
      isSelected,
      isDisabled,
      isFocused,
      handleItemClick,
      handleItemKeyDown,
      handleItemFocus,
      handleItemBlur,
    ],
  );

  // Cleanup type-ahead timeout
  useEffect(() => {
    return () => {
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data access
    items,
    getItem,
    getItemIndex,

    // Selection state
    selectedKeys,
    selectionMode,
    selectionBehavior,

    // Focus state
    focusedKey,

    // State queries
    isSelected,
    isFocused,
    isDisabled,

    // Selection actions
    select,
    deselect,
    toggle,
    selectRange,
    selectAll,
    clearSelection,

    // Focus actions
    setFocusedKey,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,

    // Event handlers
    handleItemClick,
    handleItemKeyDown,
    handleItemFocus,
    handleItemBlur,

    // Utility
    getNavigationProps,
    getItemProps,
  };
}
