import { memo, type ReactNode } from "react";
import { clsx } from "clsx";
import * as RadixScrollArea from "@radix-ui/react-scroll-area";
import useMeasure from "react-use-measure";
// import { ParentSize } from "@visx/responsive";

export function InnerScrollArea({
  children,
  header,
  footer,
  className,
  shrink = false,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  shrink?: boolean;
}) {
  const [headerRef, headerBounds] = useMeasure();
  const [footerRef, footerBounds] = useMeasure();

  return (
    <div
      className={clsx(
        "relative w-full",
        shrink ? "h-auto max-h-full" : "h-full",
        className,
      )}
    >
      {header && (
        <div
          ref={headerRef}
          className="absolute top-0 left-0 right-0 z-10 backdrop-blur-md"
        >
          {header}
        </div>
      )}
      {footer && (
        <div
          ref={footerRef}
          className="absolute bottom-0 left-0 right-0 z-10 backdrop-blur-md"
        >
          {footer}
        </div>
      )}
      <RadixScrollArea.Root className={clsx("w-full h-full overflow-hidden")}>
        <RadixScrollArea.Viewport className={clsx("w-full h-full")}>
          <div className="w-full" style={{ height: headerBounds.height }} />
          {children}
          <div className="w-full" style={{ height: footerBounds.height }} />
        </RadixScrollArea.Viewport>
        <RadixScrollArea.Scrollbar
          className="flex select-none touch-none pr-0.5 pl-0.5 bg-black/5 dark:bg-white/5 transition-colors duration-[160ms] ease-out hover:dark:bg-white/25 hover:bg-black/25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
          orientation="vertical"
          style={{
            paddingTop: headerBounds.height + 2,
            paddingBottom: footerBounds.height + 2,
          }}
        >
          <RadixScrollArea.Thumb className="flex-1 bg-default-500/75 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[22px] before:min-h-[22px]" />
        </RadixScrollArea.Scrollbar>
        <RadixScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 bg-black/5 dark:bg-white/5 transition-colors duration-[160ms] ease-out hover:dark:bg-white/25 hover:bg-black/25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
          orientation="horizontal"
        >
          <RadixScrollArea.Thumb className="flex-1 bg-default-500/75 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[22px] before:min-h-[22px]" />
        </RadixScrollArea.Scrollbar>
        <RadixScrollArea.Corner className="bg-black/5" />
      </RadixScrollArea.Root>
    </div>
  );
}

export const ScrollArea = memo(InnerScrollArea);
