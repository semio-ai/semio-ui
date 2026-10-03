import { useState, useCallback, useMemo, useRef, useEffect } from "react";

export type SelectionMode = "none" | "single" | "multiple";

export interface ListItem {
  key: string;
  disabled?: boolean;
}

export interface UseListStateOptions<T extends ListItem> {
  // Data
  items: T[];
  getSearchText?: (item: T) => string;

  // Selection configuration
  selectionMode?: SelectionMode;

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

export interface ListState<T extends ListItem> {
  // Data access
  items: T[];
  getItem: (key: string) => T | undefined;
  getItemIndex: (key: string) => number;

  // Selection state
  selectedKeys: Set<string>;
  selectionMode: SelectionMode;

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

export function useListState<T extends ListItem>({
  items,
  getSearchText,
  selectionMode = "none",
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
}: UseListStateOptions<T>): ListState<T> {
  // Internal state for uncontrolled mode
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] = useState(defaultSelectedKeys);
  const [uncontrolledFocusedKey, setUncontrolledFocusedKey] = useState(defaultFocusedKey);
  const [anchorKey, setAnchorKey] = useState<string | null>(null);

  // Type-ahead state
  const [typeAheadQuery, setTypeAheadQuery] = useState("");
  const typeAheadTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
      setAnchorKey(key);
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

      // For Finder-style behavior, replace selection with range
      const newKeys = new Set(rangeKeys);
      updateSelection(newKeys);
    },
    [selectionMode, enabledKeys, updateSelection],
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

  // Mouse click handler - desktop finder/file style
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
        // In single mode, allow deselecting if disallowEmptySelection is false
        if (isSelected(key) && !disallowEmptySelection) {
          updateSelection(new Set());
        } else {
          select(key);
        }
        return;
      }

      // Multi-select mode - desktop finder/file behavior
      if (event.shiftKey && anchorKey && selectionMode === "multiple") {
        // Shift+Click: Extend selection from anchor to clicked item (only in multiple mode)
        selectRange(anchorKey, key);
      } else if (event.ctrlKey || event.metaKey) {
        // Cmd+Click: Toggle selection of clicked item
        toggle(key);
        setAnchorKey(key);
      } else {
        // Regular click: Select only this item
        // If clicking on already selected item when multiple are selected, allow deselection
        // if it's the only selected item and disallowEmptySelection is false
        if (selectedKeys.size === 1 && isSelected(key) && !disallowEmptySelection) {
          updateSelection(new Set());
        } else {
          updateSelection(new Set([key]));
        }
        setAnchorKey(key);
      }
    },
    [
      isDisabled,
      setFocusedKey,
      selectionMode,
      select,
      toggle,
      selectRange,
      anchorKey,
      updateSelection,
      onAction,
      isSelected,
      selectedKeys,
      disallowEmptySelection,
    ],
  );

  // Keyboard handler - desktop finder/file style
  const handleItemKeyDown = useCallback(
    (key: string, event: KeyboardEvent) => {
      if (isDisabled(key)) return;

      // Call custom keydown handler first
      onKeyDown?.(key, event);

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          if (event.ctrlKey || event.metaKey) {
            // Cmd+Arrow: Move focus without changing selection
            focusNext();
          } else if (event.shiftKey && selectionMode === "multiple") {
            // Shift+Arrow: Extend selection from anchor
            const nextKey = getNextKey(key);
            if (!nextKey) return;
            const anchor = anchorKey || key;
            selectRange(anchor, nextKey);
            setFocusedKey(nextKey);
          } else {
            // Regular Arrow: Move focus and select only that item
            const nextKey = getNextKey(key);
            if (!nextKey) return;
            setFocusedKey(nextKey);
            if (selectionMode !== "none") {
              updateSelection(new Set([nextKey]));
              setAnchorKey(nextKey);
            }
          }
          break;

        case "ArrowUp":
          event.preventDefault();
          if (event.ctrlKey || event.metaKey) {
            // Cmd+Arrow: Move focus without changing selection
            focusPrevious();
          } else if (event.shiftKey && selectionMode === "multiple") {
            // Shift+Arrow: Extend selection from anchor
            const prevKey = getPreviousKey(key);
            if (!prevKey) return;
            const anchor = anchorKey || key;
            selectRange(anchor, prevKey);
            setFocusedKey(prevKey);
          } else {
            // Regular Arrow: Move focus and select only that item
            const prevKey = getPreviousKey(key);
            if (!prevKey) return;
            setFocusedKey(prevKey);
            if (selectionMode !== "none") {
              updateSelection(new Set([prevKey]));
              setAnchorKey(prevKey);
            }
          }
          break;

        case "Home":
          event.preventDefault();
          if (event.ctrlKey || event.metaKey) {
            focusFirst();
          } else if (event.shiftKey && selectionMode === "multiple") {
            const firstKey = enabledKeys[0];
            if (!firstKey) return;
            const anchor = anchorKey || key;
            selectRange(anchor, firstKey);
            setFocusedKey(firstKey);
          } else {
            const firstKey = enabledKeys[0];
            if (!firstKey) return;
            setFocusedKey(firstKey);
            if (selectionMode !== "none") {
              updateSelection(new Set([firstKey]));
              setAnchorKey(firstKey);
            }
          }
          break;

        case "End":
          event.preventDefault();
          if (event.ctrlKey || event.metaKey) {
            focusLast();
          } else if (event.shiftKey && selectionMode === "multiple") {
            const lastKey = enabledKeys[enabledKeys.length - 1];
            if (!lastKey) return;
            const anchor = anchorKey || key;
            selectRange(anchor, lastKey);
            setFocusedKey(lastKey);
          } else {
            const lastKey = enabledKeys[enabledKeys.length - 1];
            if (!lastKey) return;
            setFocusedKey(lastKey);
            if (selectionMode !== "none") {
              updateSelection(new Set([lastKey]));
              setAnchorKey(lastKey);
            }
          }
          break;

        case " ":
          event.preventDefault();
          if (selectionMode === "none") {
            onAction?.(key, event);
          } else {
            // Space: Toggle selection of focused item
            toggle(key);
            setAnchorKey(key);
          }
          break;

        case "Enter":
          event.preventDefault();
          if (onAction) {
            onAction(key, event);
          } else if (selectionMode !== "none") {
            // If no onAction, behave like click with current modifiers
            if (event.shiftKey && anchorKey && selectionMode === "multiple") {
              selectRange(anchorKey, key);
            } else if ((event.ctrlKey || event.metaKey) && selectionMode === "multiple") {
              toggle(key);
              setAnchorKey(key);
            } else {
              // Regular Enter: Allow deselection if it's the only selected item and disallowEmptySelection is false
              if (selectedKeys.size === 1 && isSelected(key) && !disallowEmptySelection) {
                updateSelection(new Set());
              } else {
                updateSelection(new Set([key]));
              }
              setAnchorKey(key);
            }
          }
          break;

        case "a":
          if (!(event.ctrlKey || event.metaKey) || selectionMode !== "multiple") {
            // Allow type-ahead for 'a' if not Cmd+A or not in multiple mode
            event.key.length === 1 &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.altKey &&
              performTypeAhead(event.key);
            break;
          }
          event.preventDefault();
          selectAll();
          break;

        case "Escape":
          event.preventDefault();
          clearSelection();
          setAnchorKey(null);
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
      anchorKey,
      updateSelection,
      isSelected,
      selectedKeys,
      disallowEmptySelection,
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
