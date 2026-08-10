import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

/**
 * Which slice of a long, **uniform-height** row list is worth rendering, and how
 * much empty space stands in for the rest.
 *
 * Windowing, not a virtualizer. It assumes every row is the same height, which the row
 * primitives guarantee — `ListRow` and `TreeRow` both take their height from
 * `ROW_HEIGHT[size]`, because a row in this system is deliberately a single line. One
 * measurement therefore describes every row, so there is no per-row measurement cache, no
 * resize bookkeeping, and no dependency to add: a scroll offset and a viewport height are
 * the whole state.
 *
 * ## Why the height is measured rather than declared
 *
 * `ROW_HEIGHT` is a Tailwind class, and `Md` is `h-9` = `2.25rem` — a value that depends on
 * the **consumer's** root font size. A library that hard-coded 36px would put the
 * spacers slightly out of step with the rows in any app that sets `html { font-size }`
 * to anything but 16px, and the error compounds with every row: half a pixel per row
 * is five hundred pixels of drift by row one thousand, which reads as the list
 * scrolling to the wrong place rather than as a rounding bug. So
 * {@link UseRowWindowOptions.estimatedRowHeight} only has to be close enough for the
 * first paint; {@link RowWindow.measureRef} then reports the real height from a
 * mounted row and the window corrects itself.
 *
 * ## Keeping the keyboard cursor mounted
 *
 * {@link UseRowWindowOptions.pinnedIndex} is always inside the window. That is what
 * makes roving focus work across a window edge: the composite moves the cursor, then
 * focuses `elementsRef.current[next]`, and by the time that runs React has committed
 * the row it just asked for. Without the pin, an arrow key at the edge of the
 * viewport would move the cursor to a row that does not exist and drop focus to the
 * body.
 */
export interface UseRowWindowOptions {
  /** Total number of rows in the data. */
  total: number;
  /**
   * The element that scrolls. Rows are positioned by spacers inside it, so its
   * `scrollTop` and `clientHeight` are the only inputs.
   *
   * A consumer whose scroll container is a `ScrollArea` passes that component's
   * `viewportRef` — the Radix viewport is the element that actually scrolls, not the
   * `ScrollArea` root.
   */
  scrollRef: RefObject<HTMLElement | null>;
  /** Row height in px for the first paint, before a real row can be measured. */
  estimatedRowHeight: number;
  /** Rows to render beyond each edge of the viewport, absorbing fast scrolls. */
  overscan?: number;
  /** Row to keep mounted wherever the scroll offset is — the keyboard cursor. */
  pinnedIndex?: number;
  /** When false, the window is the whole list and the spacers are zero. */
  enabled?: boolean;
}

export interface RowWindow {
  /** First rendered row index, inclusive. */
  start: number;
  /** Last rendered row index, exclusive. */
  end: number;
  /** Height of the spacer standing in for the rows above {@link start}. */
  paddingTop: number;
  /** Height of the spacer standing in for the rows below {@link end}. */
  paddingBottom: number;
  /** Height of the whole list, spacers included. */
  totalHeight: number;
  /** The row height in use — measured once a row has mounted, else the estimate. */
  rowHeight: number;
  /** Attach to any one rendered row so the real row height can be measured. */
  measureRef: (node: HTMLElement | null) => void;
  /** Bring a row into view, `block: "nearest"` style — no scrolling if it already is. */
  scrollToIndex: (index: number) => void;
  /**
   * Whether {@link UseRowWindowOptions.pinnedIndex} ended up inside the window.
   *
   * False means the cursor is too far from the scroll offset to render — after the user
   * has scrolled away from it with the mouse, say. A list that leaves it there has no
   * mounted tab stop and cannot be reached by keyboard at all, so the caller's job on
   * seeing this is to move its cursor into the window.
   */
  pinnedIndexInWindow: boolean;
}

/**
 * `ResizeObserver`'s `contentRect` excludes border and padding, but the spacers stand in for
 * whole row boxes, so the difference has to be added back. `borderBoxSize` would say it
 * directly and is not universally reported, so this reads it off the element instead.
 */
function borderBoxExtra(entry: ResizeObserverEntry): number {
  const styles = getComputedStyle(entry.target);
  return (
    (parseFloat(styles.borderTopWidth) || 0) +
    (parseFloat(styles.borderBottomWidth) || 0) +
    (parseFloat(styles.paddingTop) || 0) +
    (parseFloat(styles.paddingBottom) || 0)
  );
}

/** Enough rows to cover a typical panel before anything has been measured. */
const FIRST_PAINT_HEIGHT = 600;

export function useRowWindow({
  total,
  scrollRef,
  estimatedRowHeight,
  overscan = 6,
  pinnedIndex,
  enabled = true,
}: UseRowWindowOptions): RowWindow {
  const [rowHeight, setRowHeight] = useState(estimatedRowHeight);
  const [metrics, setMetrics] = useState({ scrollTop: 0, viewportHeight: 0 });

  // The last scroll offset that produced a re-render, as a row number. Scrolling
  // within one row's worth of pixels cannot change the window, so this collapses a
  // stream of scroll events into at most one render per row crossed.
  const lastRowRef = useRef(-1);

  const effectiveRowHeight = rowHeight > 0 ? rowHeight : estimatedRowHeight;

  // Measured from a mounted row, and kept under observation.
  //
  // Two failure modes pull in opposite directions, which is what makes this more than a
  // one-liner.
  //
  // Re-measuring on every window move is wrong: `measureRef` lands on whichever row is
  // first in the current slice, so the height would be fed back from the scroll position,
  // and any variation between rows walks the geometry away from the data. That produced a
  // start index past the end of the list and rendered nothing at all.
  //
  // Measuring exactly once is also wrong, and cost a CI run to learn: the first row can
  // mount BEFORE its styles do — a stylesheet injected asynchronously, a route-level CSS
  // chunk, a late web font — and a one-shot measurement then locks in the height of an
  // unstyled row forever. A list whose rows are really 36px tall windowed itself at 18,
  // so a scroll to row 500 arrived at row 1000.
  //
  // So: observe the row that is currently attached, and accept a change only when it is at
  // least a whole pixel. Rows are uniform by construction, which makes a whole-pixel change
  // a real change in what a row is — styles arriving, a font swapping, the page zooming —
  // while the sub-pixel differences between one row and another stay noise and cannot start
  // the feedback loop.
  const REMEASURE_THRESHOLD_PX = 1;
  const observedRef = useRef<{ node: HTMLElement; observer: ResizeObserver } | null>(null);

  const applyMeasurement = useCallback((measured: number) => {
    // Guarded against 0, which is what a row inside a `display: none` ancestor reports and
    // would otherwise divide the window into nothing.
    if (measured <= 0) return;
    setRowHeight((current) =>
      Math.abs(measured - current) >= REMEASURE_THRESHOLD_PX ? measured : current,
    );
  }, []);

  const measureRef = useCallback(
    (node: HTMLElement | null) => {
      const previous = observedRef.current;
      if (previous && previous.node !== node) {
        previous.observer.disconnect();
        observedRef.current = null;
      }
      // An unwindowed list measures nothing. `rowHeight` feeds the window arithmetic and
      // only that, and with `enabled` false the whole range renders regardless — so the
      // observer would cost one `ResizeObserver` per list to compute a number nothing
      // reads. It also keeps that requirement off consumers who never opted in: a jsdom
      // test rendering a plain `TreeGrid` has no `ResizeObserver` and does not need one.
      if (!enabled || !node || observedRef.current) return;
      applyMeasurement(node.getBoundingClientRect().height);
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) applyMeasurement(entry.contentRect.height + borderBoxExtra(entry));
      });
      observer.observe(node);
      observedRef.current = { node, observer };
    },
    [applyMeasurement, enabled],
  );

  useEffect(
    () => () => {
      observedRef.current?.observer.disconnect();
      observedRef.current = null;
    },
    [],
  );

  // A new estimate means a new row size, so start from it again rather than easing off the
  // old measurement by less than a pixel at a time.
  const lastEstimateRef = useRef(estimatedRowHeight);
  useLayoutEffect(() => {
    if (lastEstimateRef.current === estimatedRowHeight) return;
    lastEstimateRef.current = estimatedRowHeight;
    setRowHeight(estimatedRowHeight);
    const node = observedRef.current?.node;
    if (node) applyMeasurement(node.getBoundingClientRect().height);
  }, [estimatedRowHeight, applyMeasurement]);

  // The scroll element, resolved into state rather than read straight from the ref.
  //
  // A ref cannot be read during the commit that fills it: the scroll container is an
  // ANCESTOR of the list, and React attaches refs bottom-up, so at the moment this
  // component's layout effects run the container's ref is still null. Every consumer
  // hits this — a scroll container that wraps the list is the only arrangement there
  // is — so resolving in a passive effect (by which time every ref is attached) is the
  // correct reading of the ref, not a workaround for a slow one.
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const element = scrollRef.current;
    setScrollElement((current) => (current === element ? current : element));
    if (enabled && !element && process.env.NODE_ENV !== "production") {
      console.warn(
        "useRowWindow: `enabled` is true but `scrollRef` is not attached to an " +
          "element, so the list cannot be windowed and every row will render. Pass " +
          "the ref of the element that scrolls (a `ScrollArea`'s `viewportRef`).",
      );
    }
  }, [scrollRef, enabled]);

  useLayoutEffect(() => {
    if (!enabled) return;
    const element = scrollElement;
    if (!element) return;

    const read = () => {
      const nextTop = element.scrollTop;
      const nextHeight = element.clientHeight;
      const row = Math.floor(nextTop / effectiveRowHeight);
      setMetrics((current) => {
        if (row === lastRowRef.current && current.viewportHeight === nextHeight) return current;
        lastRowRef.current = row;
        return { scrollTop: nextTop, viewportHeight: nextHeight };
      });
    };

    read();
    element.addEventListener("scroll", read, { passive: true });
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", read);
      observer.disconnect();
    };
  }, [enabled, scrollElement, effectiveRowHeight]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const element = scrollElement ?? scrollRef.current;
      if (!element) return;
      const top = index * effectiveRowHeight;
      const bottom = top + effectiveRowHeight;
      if (top < element.scrollTop) element.scrollTop = top;
      else if (bottom > element.scrollTop + element.clientHeight)
        element.scrollTop = bottom - element.clientHeight;
    },
    [scrollElement, scrollRef, effectiveRowHeight],
  );

  return useMemo(() => {
    if (!enabled) {
      return {
        start: 0,
        end: total,
        paddingTop: 0,
        paddingBottom: 0,
        totalHeight: total * effectiveRowHeight,
        rowHeight: effectiveRowHeight,
        measureRef,
        scrollToIndex,
        pinnedIndexInWindow: true,
      };
    }

    // Before the viewport has been measured — the first render, when refs have not
    // attached yet — cover a panel's worth of rows rather than the whole list. The
    // layout effect corrects this before the browser paints.
    const viewportHeight = metrics.viewportHeight > 0 ? metrics.viewportHeight : FIRST_PAINT_HEIGHT;

    // Clamped at BOTH ends. The upper clamp is not defensive tidiness: a scroll offset
    // is only as meaningful as the row height it was computed with, and if that height
    // is later revised downward the same offset denotes a row past the end of the data.
    // Left unclamped, `start` then overshoots `total`, the slice comes back empty, and
    // the list renders as one very tall spacer — a blank panel with a working scrollbar.
    const lastIndex = Math.max(0, total - 1);
    let start = Math.min(
      lastIndex,
      Math.max(0, Math.floor(metrics.scrollTop / effectiveRowHeight) - overscan),
    );
    let end = Math.min(
      total,
      Math.max(
        start + 1,
        Math.ceil((metrics.scrollTop + viewportHeight) / effectiveRowHeight) + overscan,
      ),
    );

    // The keyboard cursor is mounted, but only when it is NEAR the window — extending
    // to reach it wherever it happened to be would mount every row in between, so a
    // cursor left at the top while the user scrolled to row nine thousand would mount
    // nine thousand rows and quietly undo the windowing. Beyond that reach the cursor
    // is simply not rendered, and the list moves it into the window instead (see
    // `pinnedIndexInWindow`).
    const reach = overscan;
    if (
      pinnedIndex !== undefined &&
      pinnedIndex >= 0 &&
      pinnedIndex < total &&
      pinnedIndex >= start - reach &&
      pinnedIndex <= end + reach
    ) {
      start = Math.min(start, pinnedIndex);
      end = Math.max(end, pinnedIndex + 1);
    }
    if (total === 0)
      return {
        start: 0,
        end: 0,
        paddingTop: 0,
        paddingBottom: 0,
        totalHeight: 0,
        rowHeight: effectiveRowHeight,
        measureRef,
        scrollToIndex,
        pinnedIndexInWindow: true,
      };
    if (end < start) end = start;

    return {
      start,
      end,
      paddingTop: start * effectiveRowHeight,
      paddingBottom: Math.max(0, (total - end) * effectiveRowHeight),
      totalHeight: total * effectiveRowHeight,
      rowHeight: effectiveRowHeight,
      measureRef,
      scrollToIndex,
      pinnedIndexInWindow: pinnedIndex === undefined || (pinnedIndex >= start && pinnedIndex < end),
    };
  }, [
    enabled,
    total,
    metrics,
    effectiveRowHeight,
    overscan,
    pinnedIndex,
    measureRef,
    scrollToIndex,
  ]);
}
