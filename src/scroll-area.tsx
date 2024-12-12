import { memo, type ReactNode, type CSSProperties } from "react";
import { clsx } from "clsx";
import * as RadixScrollArea from "@radix-ui/react-scroll-area";
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
  className,
  style,
  shrink = false,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
  shrink?: boolean;
}) {
  const [headerRef, headerBounds] = useMeasure();
  const [footerRef, footerBounds] = useMeasure();

  return (
    <div
      className={clsx(
        "relative",
        "overflow-hidden overscroll-contain w-full",
        shrink ? "h-fit" : "h-full",
        className,
      )}
      style={style}
    >
      {header && (
        <div
          ref={headerRef}
          className="absolute top-0 left-0 right-0 z-[5] backdrop-blur-md background-transparent"
        >
          {header}
        </div>
      )}
      {footer && (
        <div
          ref={footerRef}
          className="absolute bottom-0 left-0 right-0 z-[5] backdrop-blur-md background-transparent"
        >
          {footer}
        </div>
      )}
      <RadixScrollArea.Root
        type="auto"
        className={clsx(
          "overflow-hidden overscroll-contain w-full",
          shrink ? "h-fit" : "h-full",
          className,
        )}
      >
        <RadixScrollArea.Viewport
          className={clsx("w-full", shrink ? "h-fit" : "h-full", className)}
        >
          {header && <div className="w-full" style={{ height: headerBounds.height }} />}
          {children}
          {footer && <div className="w-full" style={{ height: footerBounds.height }} />}
        </RadixScrollArea.Viewport>
        <RadixScrollArea.Scrollbar
          className="flex select-none touch-none py-1 px-0.5 bg-black/5 dark:bg-white/5 transition-colors duration-[160ms] ease-out hover:dark:bg-white/25 hover:bg-black/25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
          orientation="vertical"
          style={{
            paddingTop: headerBounds.height + 2,
            paddingBottom: footerBounds.height + 2,
          }}
        >
          <RadixScrollArea.Thumb className="flex-1 bg-default-500/75 rounded-none relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[22px] before:min-h-[22px]" />
        </RadixScrollArea.Scrollbar>
        <RadixScrollArea.Scrollbar
          className="flex select-none touch-none py-0.5 px-1 bg-black/5 dark:bg-white/5 transition-colors duration-[160ms] ease-out hover:dark:bg-white/25 hover:bg-black/25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
          orientation="horizontal"
        >
          <RadixScrollArea.Thumb className="flex-1 bg-default-500/75 rounded-none relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[22px] before:min-h-[22px]" />
        </RadixScrollArea.Scrollbar>
        <RadixScrollArea.Corner className="bg-black/5" />
      </RadixScrollArea.Root>
    </div>
  );
}

export const ScrollArea = memo(InnerScrollArea);
