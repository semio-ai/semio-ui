import { memo, type ReactNode, type CSSProperties } from "react";
import { clsx } from "clsx";
import { ScrollArea as RadixScrollArea } from "radix-ui";
import useMeasure from "react-use-measure";

/**
 * Renders a scrollable area with optional header and footer.
 *
 * @example
 * ```tsx
 * <InnerScrollArea>
 *   <div>Content goes here</div>
 * </InnerScrollArea>
 * ```
 *
 * @param children - The content to be rendered inside the scroll area.
 * @param header - The optional header component to be displayed at the top of the scroll area.
 * @param footer - The optional footer component to be displayed at the bottom of the scroll area.
 * @param className - The optional CSS class name for the scroll area container.
 * @param shrink - Determines whether the scroll area should shrink to fit its content.
 * @returns The rendered scroll area component.
 */
export function InnerScrollArea({
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
}: {
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
}) {
  const [headerRef, headerBounds] = useMeasure();
  const [footerRef, footerBounds] = useMeasure();

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
            "bg-black/5 dark:bg-white/5 transition-colors duration-[160ms]",
            "ease-out dark:hover:bg-white/25 hover:bg-black/25",
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
            "bg-black/5 dark:bg-white/5 transition-colors duration-[160ms]",
            "ease-out dark:hover:bg-white/25 hover:bg-black/25",
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
}

export const ScrollArea = memo(InnerScrollArea);
