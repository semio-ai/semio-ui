import {
  memo,
  type ReactNode,
  type CSSProperties,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { clsx } from "clsx";
import { ScrollArea as RadixScrollArea } from "radix-ui";
import useMeasure from "react-use-measure";

// Types for scroll tracking
export interface ScrollInfo {
  scrollTop: number;
  scrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
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

  // Controlled/Uncontrolled scroll props
  scrollTop?: number;
  scrollLeft?: number;
  onScrollChange?: (scrollInfo: ScrollInfo) => void;
  onViewportChange?: (viewportInfo: ViewportInfo) => void;
}

/**
 * Renders a scrollable area with optional header and footer.
 * Supports both controlled and uncontrolled modes:
 *
 * - Uncontrolled (default): Manages its own scroll state
 * - Controlled: scrollTop/scrollLeft props control the scroll position
 *
 * @example Uncontrolled
 * ```tsx
 * <ScrollArea onScrollChange={(info) => console.log(info)}>
 *   <div>Content goes here</div>
 * </ScrollArea>
 * ```
 *
 * @example Controlled
 * ```tsx
 * const [scrollTop, setScrollTop] = useState(0);
 * <ScrollArea
 *   scrollTop={scrollTop}
 *   onScrollChange={(info) => setScrollTop(info.scrollTop)}
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
      scrollTop,
      scrollLeft,
      onScrollChange,
      onViewportChange,
    },
    ref,
  ) => {
    const [headerRef, headerBounds] = useMeasure();
    const [footerRef, footerBounds] = useMeasure();

    // Ref to access the Radix ScrollArea viewport
    const viewportRef = useRef<HTMLDivElement>(null);

    // Track if we're in controlled mode
    const isControlled = scrollTop !== undefined || scrollLeft !== undefined;

    // Prevent infinite loops when syncing controlled props
    const isUpdatingFromProps = useRef(false);

    // Track the last known DOM scroll position to detect external vs internal changes
    const lastDOMScrollTop = useRef<number>(0);
    const lastDOMScrollLeft = useRef<number>(0);

    // Debounced sync mechanism to prevent stuttering
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingSyncRef = useRef<{ scrollTop?: number; scrollLeft?: number } | null>(null);

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

    // Handle scroll events
    const handleScroll = useCallback(
      (event: Event) => {
        // Don't emit events when we're updating from controlled props
        if (isUpdatingFromProps.current) return;

        const target = event.target as HTMLElement;
        if (!target) return;

        // Update our tracking of DOM scroll position
        lastDOMScrollTop.current = target.scrollTop;
        lastDOMScrollLeft.current = target.scrollLeft;

        const scrollInfo: ScrollInfo = {
          scrollTop: target.scrollTop,
          scrollLeft: target.scrollLeft,
          scrollHeight: target.scrollHeight,
          scrollWidth: target.scrollWidth,
          clientHeight: target.clientHeight,
          clientWidth: target.clientWidth,
        };

        onScrollChange?.(scrollInfo);

        // Calculate viewport info if callback is provided
        if (onViewportChange) {
          const viewportInfo: ViewportInfo = {
            visibleTop: target.scrollTop,
            visibleBottom: target.scrollTop + target.clientHeight,
            visibleLeft: target.scrollLeft,
            visibleRight: target.scrollLeft + target.clientWidth,
            totalHeight: target.scrollHeight,
            totalWidth: target.scrollWidth,
          };

          onViewportChange(viewportInfo);
        }
      },
      [onScrollChange, onViewportChange],
    );

    // Debounced sync function to prevent stuttering
    const debouncedSync = useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport || !pendingSyncRef.current) return;

      const { scrollTop: targetScrollTop, scrollLeft: targetScrollLeft } = pendingSyncRef.current;

      // Only sync if there's a meaningful difference (prevents micro-adjustments)
      const needsScrollTopSync =
        targetScrollTop !== undefined && Math.abs(targetScrollTop - viewport.scrollTop) > 1;
      const needsScrollLeftSync =
        targetScrollLeft !== undefined && Math.abs(targetScrollLeft - viewport.scrollLeft) > 1;

      if (needsScrollTopSync || needsScrollLeftSync) {
        isUpdatingFromProps.current = true;

        if (needsScrollTopSync) {
          viewport.scrollTop = targetScrollTop!;
          lastDOMScrollTop.current = targetScrollTop!;
        }
        if (needsScrollLeftSync) {
          viewport.scrollLeft = targetScrollLeft!;
          lastDOMScrollLeft.current = targetScrollLeft!;
        }

        // Brief cooldown to prevent immediate callback loops
        setTimeout(() => {
          isUpdatingFromProps.current = false;
        }, 16);
      }

      pendingSyncRef.current = null;
    }, []);

    // Sync controlled props to DOM with proper debouncing
    useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport || !isControlled) return;

      // Store the pending sync values
      pendingSyncRef.current = { scrollTop, scrollLeft };

      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Schedule debounced sync
      syncTimeoutRef.current = setTimeout(debouncedSync, 5);

      // Cleanup timeout on unmount
      return () => {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
      };
    }, [scrollTop, scrollLeft, isControlled, debouncedSync]);

    // Update DOM position tracking whenever controlled props change
    useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      // Keep tracking updated with current DOM state
      lastDOMScrollTop.current = viewport.scrollTop;
      lastDOMScrollLeft.current = viewport.scrollLeft;
    });

    // Attach scroll event listener to the viewport
    useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport || (!onScrollChange && !onViewportChange)) return;

      viewport.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        viewport.removeEventListener("scroll", handleScroll);
      };
    }, [handleScroll, onScrollChange, onViewportChange]);

    // Expose ref methods for programmatic control
    useImperativeHandle(
      ref,
      () => ({
        scrollTo: (options: { top?: number; left?: number; behavior?: ScrollBehavior }) => {
          const viewport = viewportRef.current;
          if (!viewport) return;

          // In controlled mode, we don't directly scroll - the consumer should update their state
          if (isControlled) {
            console.warn(
              "ScrollArea: scrollTo() called on controlled component. Update scrollTop/scrollLeft props instead.",
            );
            return;
          }

          viewport.scrollTo({
            top: options.top,
            left: options.left,
            behavior: options.behavior || "smooth",
          });
        },

        scrollIntoView: (element: Element, options?: ScrollIntoViewOptions) => {
          const viewport = viewportRef.current;
          if (!viewport) return;

          if (isControlled) {
            console.warn(
              "ScrollArea: scrollIntoView() called on controlled component. Calculate and update scrollTop/scrollLeft props instead.",
            );
            return;
          }

          // Check if element is within our viewport
          if (viewport.contains(element)) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
              ...options,
            });
          }
        },

        getScrollInfo,
        getViewportInfo,
      }),
      [isControlled, getScrollInfo, getViewportInfo],
    );

    return (
      <RadixScrollArea.Root
        type="hover"
        className={clsx(
          "relative",
          "overflow-hidden overscroll-contain",
          shrinkHeight ? "h-fit" : "h-full",
          shrinkWidth ? "w-fit" : "w-full",
          wrapperClassName,
        )}
        style={style}
      >
        <RadixScrollArea.Viewport
          ref={viewportRef}
          className={clsx(
            shrinkHeight ? "h-fit" : "h-full",
            shrinkWidth ? "w-fit" : "w-full",
            className,
          )}
        >
          {header && orientation === "vertical" && (
            <div className="w-full" style={{ height: headerBounds.height }} />
          )}
          {header && orientation === "horizontal" && (
            <div className="h-full" style={{ width: headerBounds.width }} />
          )}
          {children}
          {footer && orientation === "vertical" && (
            <div className="w-full" style={{ height: footerBounds.height }} />
          )}
          {footer && orientation === "horizontal" && (
            <div className="h-full" style={{ width: footerBounds.width }} />
          )}
        </RadixScrollArea.Viewport>
        {(orientation === "both" || orientation === "vertical") && (
          <RadixScrollArea.Scrollbar
            className={clsx(
              "flex select-none touch-none py-1 px-0.5",
              "ease-out transition-colors duration-[160ms]",
              showGutter && "dark:hover:bg-white/25 hover:bg-black/25 bg-black/5 dark:bg-white/5",
              "data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5",
            )}
            orientation="vertical"
            style={{
              marginTop: headerBounds.height > 0 ? headerBounds.height + 2 : 0,
              marginBottom: footerBounds.height > 0 ? footerBounds.height + 2 : 0,
            }}
          >
            <RadixScrollArea.Thumb
              className={clsx(
                "flex-1 bg-default-500/75 rounded-sm relative",
                "before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2",
                "before:-translate-y-1/2 before:w-full before:h-full before:min-w-[22px] before:min-h-[22px]",
              )}
            />
          </RadixScrollArea.Scrollbar>
        )}
        {(orientation === "both" || orientation === "horizontal") && (
          <RadixScrollArea.Scrollbar
            className={clsx(
              "flex select-none touch-none py-0.5 px-1",
              "ease-out transition-colors duration-[160ms]",
              showGutter && "dark:hover:bg-white/25 hover:bg-black/25 bg-black/5 dark:bg-white/5",
              "data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5",
            )}
            orientation="horizontal"
            style={{
              marginLeft: headerBounds.width > 0 ? headerBounds.width + 2 : 0,
              marginRight: footerBounds.width > 0 ? footerBounds.width + 2 : 0,
            }}
          >
            <RadixScrollArea.Thumb
              className={clsx(
                "flex-1 bg-default-500/75 rounded-sm relative",
                "before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2",
                "before:-translate-y-1/2 before:w-full before:h-full before:min-w-[22px] before:min-h-[22px]",
              )}
            />
          </RadixScrollArea.Scrollbar>
        )}
        <RadixScrollArea.Corner className="bg-black/5" />
        {header && (
          <div
            ref={headerRef}
            className={clsx(
              "absolute top-0 left-0",
              orientation === "horizontal" ? "bottom-0" : "right-0",
              headerClassName,
            )}
          >
            {header}
          </div>
        )}
        {footer && (
          <div
            ref={footerRef}
            className={clsx(
              "absolute bottom-0 right-0",
              orientation === "horizontal" ? "top-0" : "left-0",
              footerClassName,
            )}
          >
            {footer}
          </div>
        )}
      </RadixScrollArea.Root>
    );
  },
);

InnerScrollArea.displayName = "InnerScrollArea";

export const ScrollArea = memo(InnerScrollArea);
