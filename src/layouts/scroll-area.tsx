import {
  memo,
  type ReactNode,
  type CSSProperties,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { clsx } from "clsx";
import { ScrollArea as RadixScrollArea } from "radix-ui";
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

  // Legacy synchronization (higher latency)
  externalScrollTop?: number;
  externalScrollLeft?: number;
  onScrollSync?: (scrollTop: number, scrollLeft: number) => void;
}

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
      externalScrollTop,
      externalScrollLeft,
      onScrollSync,
    },
    ref,
  ) => {
    const [headerRef] = useMeasure();
    const [footerRef] = useMeasure();

    // Ref to access the Radix ScrollArea viewport
    const viewportRef = useRef<HTMLDivElement>(null);

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

      let scrollTimeout: NodeJS.Timeout;

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
      <RadixScrollArea.Root
        type="hover"
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
      >
        {header && (
          <div ref={headerRef} className={clsx("flex-shrink-0", headerClassName)}>
            {header}
          </div>
        )}

        <div className="flex-1 relative min-h-0 min-w-0">
          <RadixScrollArea.Viewport
            ref={viewportRef}
            className={clsx(
              "h-full w-full",
              overscrollDisabled ? "overscroll-none" : "overscroll-contain",
              className,
            )}
          >
            {children}
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
        </div>

        {footer && (
          <div ref={footerRef} className={clsx("flex-shrink-0", footerClassName)}>
            {footer}
          </div>
        )}
      </RadixScrollArea.Root>
    );
  },
);

InnerScrollArea.displayName = "InnerScrollArea";

export const ScrollArea = memo(InnerScrollArea);
