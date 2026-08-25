import {
  memo,
  type ReactNode,
  type CSSProperties,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useEffect,
  type Ref,
} from "react";
import { clsx } from "clsx";
import { mergeRefs } from "react-merge-refs";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import useMeasure from "react-use-measure";
import { useGesture } from "@use-gesture/react";
import { useMotionValue, useMotionValueEvent, type MotionValue } from "motion/react";

// Types for scroll tracking
export interface ScrollInfo {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
  isOverscrolling: boolean;
}

export interface ViewportInfo {
  visibleTop: number;
  visibleBottom: number;
  visibleLeft: number;
  visibleRight: number;
  totalHeight: number;
  totalWidth: number;
}

// Ref interface for programmatic control
export interface ScrollAreaRef {
  scrollTo: (options: { top?: number; left?: number; behavior?: ScrollBehavior }) => void;
  scrollIntoView: (element: Element, options?: ScrollIntoViewOptions) => void;
  getScrollInfo: () => ScrollInfo | null;
  getViewportInfo: () => ViewportInfo | null;
}

interface ScrollAreaProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  wrapperClassName?: string;
  className?: string;
  headerClassName?: string;
  footerClassName?: string;
  style?: CSSProperties;
  shrinkHeight?: boolean;
  shrinkWidth?: boolean;
  orientation?: "vertical" | "horizontal" | "both";
  showGutter?: boolean;
  // Scroll tracking callbacks
  onScrollChange?: (scrollInfo: ScrollInfo) => void;
  onViewportChange?: (viewportInfo: ViewportInfo) => void;

  // Motion-based scroll synchronization (low latency)
  motionScrollY?: MotionValue<number>;
  motionScrollX?: MotionValue<number>;

  /**
   * The element that actually scrolls — the scroll viewport, not this component's root.
   *
   * Exposed for consumers that must read or window against the real scroll box, such
   * as a virtualized `ListGrid`/`TreeGrid`, which needs its `scrollTop` and
   * `clientHeight` continuously rather than at the moments a callback happens to fire.
   *
   * Purely additive: the existing scroll-tracking seams — `onScrollChange`,
   * `onViewportChange`, `motionScrollY`/`motionScrollX` and the imperative
   * `ScrollAreaRef` — are untouched and remain the way to observe scrolling. This hands
   * out the node and nothing else.
   *
   * Pass something **stable** — a `useRef` object, or a callback held still with
   * `useCallback`. React detaches and re-attaches a ref whose identity changed, so an
   * inline arrow here hands the consumer a `null` on every render of this component. That
   * is React's behaviour rather than this component's, but it matters more than usual for
   * this prop: a windowed list reads its entire geometry from the node.
   */
  viewportRef?: Ref<HTMLDivElement>;

  // Legacy synchronization (higher latency)
  externalScrollTop?: number;
  externalScrollLeft?: number;
  onScrollSync?: (scrollTop: number, scrollLeft: number) => void;
}

/**
 * How much a content box may exceed its viewport before that counts as overflow.
 *
 * Half a pixel, because the question being answered is only ever "is this a real
 * overflow or a rounding artefact" — a genuine overflow worth a scrollbar is never
 * sub-pixel, and nothing useful can be scrolled into view at that size.
 */
const OVERFLOW_EPSILON = 0.5;

/**
 * Whether the viewport's content genuinely exceeds it, measured in **fractional**
 * pixels.
 *
 * `scrollWidth`/`scrollHeight` and `clientWidth`/`clientHeight` are integers by
 * spec, and where a viewport's box lands on a fractional size — routine at a
 * fractional device pixel ratio, e.g. a scaled display — WebKit rounds the pair in
 * opposite directions and reports `scroll = client + 1` for content that fits
 * exactly. Measured in the app: a 564.198px-tall menu reporting client 564 / scroll
 * 565 with 143.967px of content, and a 750.870px-wide panel reporting client 751 /
 * scroll 752 with its content exactly as wide as its box.
 *
 * This is why the measurement is made here rather than read off Base UI's
 * `data-has-overflow-x` / `data-has-overflow-y`, which would otherwise be the obvious
 * source. Base UI decides an axis from `clientHeight >= scrollHeight` — precisely the
 * integer comparison above — so its verdict carries the artefact rather than
 * correcting it, and keying the suppression on those attributes would reintroduce the
 * phantom bar in the browser the suppression exists for.
 *
 * `getBoundingClientRect` is not rounded, so comparing the content box against the
 * viewport's own box answers the question the integers cannot. Sizes only — a
 * scrolled viewport moves its content's rect without resizing it, so this is
 * independent of scroll position.
 *
 * Slightly conservative where the viewport carries padding: the content box is
 * measured against the border box, so an overflow smaller than the padding can go
 * unnoticed. That is the same sub-pixel range being deliberately ignored.
 *
 * Failure mode is a missing scrollbar, never a stuck viewport: the element itself
 * keeps `overflow: scroll`, so wheel, trackpad and keyboard scrolling are unaffected
 * by anything decided here.
 */
function useContentOverflow(viewportEl: HTMLDivElement | null): {
  x: boolean;
  y: boolean;
} {
  const [overflow, setOverflow] = useState({ x: false, y: false });

  useEffect(() => {
    if (!viewportEl) return;

    const measure = () => {
      // `Content` wraps the children in a single element; that wrapper *is* the
      // scrollable content.
      const content = viewportEl.firstElementChild;
      if (!content) return;
      const styles = getComputedStyle(viewportEl);
      const borderX =
        (parseFloat(styles.borderLeftWidth) || 0) + (parseFloat(styles.borderRightWidth) || 0);
      const borderY =
        (parseFloat(styles.borderTopWidth) || 0) + (parseFloat(styles.borderBottomWidth) || 0);
      const box = viewportEl.getBoundingClientRect();
      const contentBox = content.getBoundingClientRect();
      const next = {
        x: contentBox.width - (box.width - borderX) > OVERFLOW_EPSILON,
        y: contentBox.height - (box.height - borderY) > OVERFLOW_EPSILON,
      };
      setOverflow((prev) => (prev.x === next.x && prev.y === next.y ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewportEl);
    if (viewportEl.firstElementChild) observer.observe(viewportEl.firstElementChild);
    return () => {
      observer.disconnect();
    };
    // The NODE, not a ref holding it. A ref object is stable, so an effect keyed on
    // one runs exactly once — and if the viewport has not attached by then it returns
    // early and never looks again, leaving this stuck at its initial `{x:false,
    // y:false}` for the lifetime of the component. That state locks BOTH axes to
    // `overflow: hidden`, so the failure is content nobody can reach.
  }, [viewportEl]);

  return overflow;
}

/**
 * How long the scrollbars linger after the pointer leaves.
 *
 * The scrollbars are mounted only while the pointer is over the area, so that a
 * gutter is not permanently painted over every list in the app. Unmounting the
 * instant the pointer leaves makes them flicker when crossing the boundary, which
 * this delay absorbs.
 */
const SCROLLBAR_HIDE_DELAY = 600;

/**
 * Renders a scrollable area with natural overscroll behavior.
 * Uses padding to create "real" overscroll space that can be synchronized between multiple areas.
 *
 * @example Basic usage
 * ```tsx
 * <ScrollArea onScrollChange={(info) => console.log(info)}>
 *   <div>Content goes here</div>
 * </ScrollArea>
 * ```
 *
 * @example Synchronized scrolling
 * ```tsx
 * const [sharedScrollTop, setSharedScrollTop] = useState(0);
 * <ScrollArea
 *   externalScrollTop={sharedScrollTop}
 *   onScrollSync={(scrollTop) => setSharedScrollTop(scrollTop)}
 * >
 *   <div>Content goes here</div>
 * </ScrollArea>
 * ```
 */
export const InnerScrollArea = forwardRef<ScrollAreaRef, ScrollAreaProps>(
  (
    {
      children,
      header,
      footer,
      wrapperClassName,
      className,
      headerClassName,
      footerClassName,
      style,
      shrinkHeight = false,
      shrinkWidth = false,
      orientation = "both",
      showGutter = true,

      onScrollChange,
      onViewportChange,
      motionScrollY,
      motionScrollX,
      viewportRef: externalViewportRef,
      externalScrollTop,
      externalScrollLeft,
      onScrollSync,
    },
    ref,
  ) => {
    const [headerRef] = useMeasure();
    const [footerRef] = useMeasure();

    // Ref to access the scroll viewport
    const viewportRef = useRef<HTMLDivElement>(null);
    // Mirrored into state so the overflow measurement can key an effect on the node
    // actually attaching — see `useContentOverflow`.
    const [viewportNode, setViewportNode] = useState<HTMLDivElement | null>(null);
    // Hand the same node to the consumer, if one asked for it.
    //
    // Memoized, because `mergeRefs` is a plain function and not a hook: called in the
    // render body it returns a NEW callback every render, and React responds to a changed
    // ref callback by detaching the old one — calling it with `null` — before attaching the
    // new one. A consumer holding this ref would then see its `.current` blink to null on
    // every unrelated re-render of this component, which for a windowed list is the ref its
    // whole geometry is read from.
    const mergedViewportRef = useMemo(
      () => mergeRefs([viewportRef, setViewportNode, externalViewportRef]),
      [externalViewportRef],
    );

    // Whether the content really overflows, rather than whether the rounded scroll
    // metrics say so. Gates the scrollbars below.
    const contentOverflow = useContentOverflow(viewportNode);

    // Whether the pointer is over the area, which is what mounts the scrollbars.
    //
    // Base UI mounts a scrollbar whenever the axis overflows and expects the page to
    // hide it with CSS, but this component paints a gutter behind the track
    // (`showGutter`), so a permanently mounted bar is a permanently visible one on
    // every overflowing list in the app. Mounting on hover keeps that behaviour.
    const [pointerOver, setPointerOver] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const showScrollbars = useCallback(() => {
      clearTimeout(hideTimer.current);
      setPointerOver(true);
    }, []);
    const hideScrollbarsAfterDelay = useCallback(() => {
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setPointerOver(false), SCROLLBAR_HIDE_DELAY);
    }, []);
    useEffect(() => () => clearTimeout(hideTimer.current), []);

    // Make the thumb measure itself the moment it appears.
    //
    // Base UI positions the thumb only from the viewport's scroll handler and a resize
    // observer, never on mount; Radix positioned it on mount. Since the scrollbar here is
    // mounted on hover, it is created *after* any scrolling that happened with the pointer
    // elsewhere — a canvas-driven `motionScrollY`, `scrollTo` through the imperative
    // handle, `externalScrollTop`, keyboard scrolling, or a windowed list moving itself —
    // and would otherwise paint at the top of its track while the viewport sits somewhere
    // else entirely, until the next scroll event corrected it. A scroll event carrying no
    // actual scrolling is what makes it measure.
    useEffect(() => {
      if (!pointerOver || !viewportNode) return;
      viewportNode.dispatchEvent(new Event("scroll"));
    }, [pointerOver, viewportNode, contentOverflow.x, contentOverflow.y]);

    // Track user interaction state
    const [isUserScrolling, setIsUserScrolling] = useState(false);

    // Create internal motion values if not provided
    const internalMotionY = useMotionValue(0);
    const internalMotionX = useMotionValue(0);

    const overscrollDisabled = motionScrollY !== undefined || motionScrollX !== undefined;

    // Use provided motion values or create internal ones
    const activeMotionY = motionScrollY || internalMotionY;
    const activeMotionX = motionScrollX || internalMotionX;

    // Prevent infinite loops during sync
    const isUpdatingFromMotion = useRef(false);
    const isUpdatingFromScroll = useRef(false);

    // Helper function to get current scroll info
    const getScrollInfo = useCallback((): ScrollInfo | null => {
      const viewport = viewportRef.current;
      if (!viewport) return null;

      return {
        scrollTop: viewport.scrollTop,
        scrollLeft: viewport.scrollLeft,
        scrollHeight: viewport.scrollHeight,
        scrollWidth: viewport.scrollWidth,
        clientHeight: viewport.clientHeight,
        clientWidth: viewport.clientWidth,
        isOverscrolling: false,
      };
    }, []);

    // Helper function to get viewport info
    const getViewportInfo = useCallback((): ViewportInfo | null => {
      const viewport = viewportRef.current;
      if (!viewport) return null;

      return {
        visibleTop: viewport.scrollTop,
        visibleBottom: viewport.scrollTop + viewport.clientHeight,
        visibleLeft: viewport.scrollLeft,
        visibleRight: viewport.scrollLeft + viewport.clientWidth,
        totalHeight: viewport.scrollHeight,
        totalWidth: viewport.scrollWidth,
      };
    }, []);

    // Handle scroll with rubber banding and synchronization
    useGesture(
      {
        onScroll: ({ event }) => {
          if (!isUserScrolling) return;

          const target = event.target as HTMLElement;
          const scrollTop = target.scrollTop;
          const scrollLeft = target.scrollLeft;

          // Get scroll info for callbacks
          const scrollInfo = getScrollInfo();
          if (scrollInfo) {
            onScrollChange?.(scrollInfo);
          }

          // Get viewport info if callback is provided
          if (onViewportChange) {
            const viewportInfo = getViewportInfo();
            if (viewportInfo) {
              onViewportChange(viewportInfo);
            }
          }

          // Update motion values immediately for low-latency sync
          if (!isUpdatingFromMotion.current) {
            isUpdatingFromScroll.current = true;
            activeMotionY.set(scrollTop);
            activeMotionX.set(scrollLeft);
            isUpdatingFromScroll.current = false;
          }

          // Sync with other scroll areas (legacy callback)
          onScrollSync?.(scrollTop, scrollLeft);
        },
      },
      {
        target: viewportRef,
        eventOptions: { passive: true },
      },
    );

    // Subscribe to motion value changes for low-latency sync
    useMotionValueEvent(activeMotionY, "change", (value) => {
      if (isUpdatingFromScroll.current) return;

      const viewport = viewportRef.current;
      if (!viewport) return;

      if (Math.abs(value - viewport.scrollTop) > 0.5) {
        isUpdatingFromMotion.current = true;
        viewport.scrollTop = value;
        setTimeout(() => {
          isUpdatingFromMotion.current = false;
        }, 16);
      }
    });

    useMotionValueEvent(activeMotionX, "change", (value) => {
      if (isUpdatingFromScroll.current) return;

      const viewport = viewportRef.current;
      if (!viewport) return;

      if (Math.abs(value - viewport.scrollLeft) > 0.5) {
        isUpdatingFromMotion.current = true;
        viewport.scrollLeft = value;
        setTimeout(() => {
          isUpdatingFromMotion.current = false;
        }, 16);
      }
    });

    // Sync from external scroll positions (legacy support)
    useEffect(() => {
      if (externalScrollTop !== undefined && !isUserScrolling && viewportRef.current) {
        viewportRef.current.scrollTop = externalScrollTop;
      }
    }, [externalScrollTop, isUserScrolling]);

    useEffect(() => {
      if (externalScrollLeft !== undefined && !isUserScrolling && viewportRef.current) {
        viewportRef.current.scrollLeft = externalScrollLeft;
      }
    }, [externalScrollLeft, isUserScrolling]);

    // Track user scrolling state
    useEffect(() => {
      const element = viewportRef.current;
      if (!element) return;

      let scrollTimeout: ReturnType<typeof setTimeout>;

      const handleScrollStart = () => {
        setIsUserScrolling(true);
        clearTimeout(scrollTimeout);
      };

      const handleScrollEnd = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setIsUserScrolling(false);
        }, 150);
      };

      element.addEventListener("scroll", handleScrollStart);
      element.addEventListener("scroll", handleScrollEnd);

      return () => {
        element.removeEventListener("scroll", handleScrollStart);
        element.removeEventListener("scroll", handleScrollEnd);
        clearTimeout(scrollTimeout);
      };
    }, []);

    // Expose ref methods for programmatic control
    useImperativeHandle(
      ref,
      () => ({
        scrollTo: (options: { top?: number; left?: number; behavior?: ScrollBehavior }) => {
          // Update motion values directly for immediate sync
          if (options.top !== undefined) {
            activeMotionY.set(options.top);
          }
          if (options.left !== undefined) {
            activeMotionX.set(options.left);
          }
        },

        scrollIntoView: (element: Element, options?: ScrollIntoViewOptions) => {
          const viewport = viewportRef.current;
          if (!viewport?.contains(element)) return;

          element.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
            ...options,
          });
        },

        getScrollInfo,
        getViewportInfo,
      }),
      [activeMotionY, activeMotionX, getScrollInfo, getViewportInfo],
    );

    return (
      <ScrollAreaPrimitive.Root
        className={clsx(
          "relative",
          "overflow-hidden overscroll-none",
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          shrinkHeight ? "h-fit" : "h-full",
          shrinkWidth ? "w-fit" : "w-full",
          wrapperClassName,
        )}
        style={style}
        // Mounts and unmounts the scrollbars — see `pointerOver`.
        onPointerEnter={showScrollbars}
        onPointerLeave={hideScrollbarsAfterDelay}
      >
        {header && (
          <div ref={headerRef} className={clsx("shrink-0", headerClassName)}>
            {header}
          </div>
        )}

        {/*
          A flex box, so the viewport below can take its size from flex layout rather
          than from a percentage.

          `height: 100%` resolves against the containing block's *specified* height, so
          anywhere up the tree is content-sized — a popup that fits its content, a menu,
          a dialog whose height comes from `max-height` rather than `height` — the
          percentage resolves to `auto` and the "viewport" grows to its content instead
          of capping it. It is then larger than this box, which clips it, and the content
          past the clip is unreachable at any scroll position: scrolled fully to the end,
          the last stretch of it still sits outside the visible region. Flex sizing has no
          such dependency, and still lets the box hug its content when `shrinkHeight` /
          `shrinkWidth` ask it to.
        */}
        <div
          className={clsx(
            "relative flex min-h-0 min-w-0 flex-1 overflow-hidden",
            orientation === "horizontal" ? "flex-row" : "flex-col",
          )}
        >
          <ScrollAreaPrimitive.Viewport
            ref={mergedViewportRef}
            // Base UI names the viewport in the DOM only when the root was given an id.
            // This is the stable handle for the element that actually scrolls, so that
            // nothing has to spell a library-specific attribute to find it.
            data-scroll-area-viewport=""
            // A scroll container has to be reachable by keyboard, or its content is
            // reachable only by pointer. Base UI sets this itself, but from its own
            // integer-metric verdict, which disagrees with the measurement below in
            // exactly the sub-pixel case that verdict gets wrong — leaving a focusable
            // box with nothing to scroll. Driving it from the same measurement that
            // decides whether the axis scrolls at all keeps the two consistent.
            tabIndex={contentOverflow.x || contentOverflow.y ? 0 : -1}
            className={clsx(
              "min-h-0 min-w-0 flex-1",
              orientation === "horizontal" ? "h-full" : "w-full",
              overscrollDisabled ? "overscroll-none" : "overscroll-contain",
              orientation === "vertical" && "overflow-x-hidden",
              orientation === "horizontal" && "overflow-y-hidden",
              // Take an axis out of scrolling entirely when nothing overflows it.
              //
              // Not belt-and-braces with the scrollbars gated below — a separate
              // scrollbar. The viewport carries `overflow: scroll` on both axes and
              // hides the browser's own bar with `scrollbar-width: none` plus
              // `::-webkit-scrollbar { display: none }`. In WebKit that does not work:
              // verified in Safari 26.6 with both rules present and `scrollbar-width`
              // computing to `none`, an axis reporting one rounded pixel of overflow
              // still painted a native bar, with none of ours in the DOM. Nothing can be
              // styled away that the engine draws outside the element, so the axis has to
              // stop being scrollable.
              //
              // `!` because it has to beat the inline `overflow: scroll` Base UI sets on
              // the viewport. Safe by construction: the axis only loses scrolling while
              // the same measurement says there is nothing there to scroll to, and
              // regains it the moment content grows.
              !contentOverflow.x && "overflow-x-hidden!",
              !contentOverflow.y && "overflow-y-hidden!",
              className,
            )}
          >
            {/*
              Always rendered, though Base UI makes it optional, because the overflow
              measurement needs exactly one box to compare against the viewport. Being a
              block div rather than Radix's `display: table` wrapper, it also leaves
              padding and margin on the children working.

              `min-w-0!` on a vertical-only area, because Base UI sets `min-width:
              fit-content` on this element as an inline style, to let content wider than
              the viewport drive horizontal scrolling. On an area with no horizontal axis
              that is actively wrong: the wrapper then sizes to the widest thing inside it
              — for the standard menu-item pattern, a `nowrap` label, that is the whole
              untruncated label — so the measurement below sees horizontal overflow, the
              axis stays a scroll container, and the label's own `text-overflow` stops
              clipping at the popup's width. The result is a menu that scrolls sideways,
              with no horizontal scrollbar of its own to show for it, which is the exact
              case the suppression below exists to prevent. `!` because it has to beat the
              inline style.
            */}
            <ScrollAreaPrimitive.Content className={clsx(orientation === "vertical" && "min-w-0!")}>
              {children}
            </ScrollAreaPrimitive.Content>
          </ScrollAreaPrimitive.Viewport>

          {(orientation === "both" || orientation === "vertical") &&
            contentOverflow.y &&
            pointerOver && (
              <ScrollAreaPrimitive.Scrollbar
                className={clsx(
                  "flex touch-none px-0.5 py-1 select-none",
                  "transition-colors duration-160 ease-out",
                  showGutter &&
                    "bg-black/5 hover:bg-black/25 dark:bg-white/5 dark:hover:bg-white/25",
                  "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2.5",
                )}
                orientation="vertical"
                // The overflow decision above is otherwise not observable from a test.
                data-testid="scroll-area-scrollbar"
              >
                <ScrollAreaPrimitive.Thumb
                  className={clsx(
                    "bg-default-500/75 relative flex-1 rounded-sm",
                    "before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:content-['']",
                    "before:h-full before:min-h-5.5 before:w-full before:min-w-5.5 before:-translate-y-1/2",
                  )}
                />
              </ScrollAreaPrimitive.Scrollbar>
            )}
          {(orientation === "both" || orientation === "horizontal") &&
            contentOverflow.x &&
            pointerOver && (
              <ScrollAreaPrimitive.Scrollbar
                className={clsx(
                  "flex touch-none px-1 py-0.5 select-none",
                  "transition-colors duration-160 ease-out",
                  showGutter &&
                    "bg-black/5 hover:bg-black/25 dark:bg-white/5 dark:hover:bg-white/25",
                  "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2.5",
                )}
                orientation="horizontal"
                data-testid="scroll-area-scrollbar"
              >
                <ScrollAreaPrimitive.Thumb
                  className={clsx(
                    "bg-default-500/75 relative flex-1 rounded-sm",
                    "before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:content-['']",
                    "before:h-full before:min-h-5.5 before:w-full before:min-w-5.5 before:-translate-y-1/2",
                  )}
                />
              </ScrollAreaPrimitive.Scrollbar>
            )}
          {contentOverflow.x && contentOverflow.y && pointerOver && (
            <ScrollAreaPrimitive.Corner className="bg-black/5" />
          )}
        </div>

        {footer && (
          <div ref={footerRef} className={clsx("shrink-0", footerClassName)}>
            {footer}
          </div>
        )}
      </ScrollAreaPrimitive.Root>
    );
  },
);

InnerScrollArea.displayName = "InnerScrollArea";

export const ScrollArea = memo(InnerScrollArea);
