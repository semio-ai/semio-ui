import type { MutableRefObject, ReactNode, CSSProperties } from "react";
import { memo, useRef } from "react";
import { clsx } from "clsx";
import { useGesture } from "@use-gesture/react";

export interface LayoutProps {
  menu: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  bottomPanel?: ReactNode;
  children: ReactNode;
  menuRef?: MutableRefObject<HTMLDivElement | null>;
  leftSidebarRef?: MutableRefObject<HTMLDivElement | null>;
  rightSidebarRef?: MutableRefObject<HTMLDivElement | null>;
  bottomPanelRef?: MutableRefObject<HTMLDivElement | null>;
  style?: CSSProperties;
  gradient?: boolean;
  className?: string;
}

/**
 * Renders the inner layout of the application.
 *
 * TODO: Update with resizeable panes and pop out windows.
 *
 * @param menu - The menu component.
 * @param leftSidebar - The left sidebar component.
 * @param rightSidebar - The right sidebar component.
 * @param bottomPanel - The bottom panel component.
 * @param children - The content to be rendered in the main body.
 */
export function InnerLayout({
  menu,
  leftSidebar,
  rightSidebar,
  bottomPanel,
  children,
  menuRef,
  leftSidebarRef,
  rightSidebarRef,
  bottomPanelRef,
  style,
  gradient,
  className,
}: LayoutProps) {
  const root = useRef<HTMLDivElement>();

  useGesture(
    {
      onPinch: ({ event }) => {
        event.preventDefault();
        event.stopPropagation();
      },
    },
    {
      target: root as MutableRefObject<EventTarget>,
      eventOptions: { passive: false },
    },
  );

  return (
    <div ref={root as MutableRefObject<HTMLDivElement>} className={clsx(rootStyle, className)}>
      {/* Menu (thin left bar)*/}
      <div ref={menuRef}>{menu}</div>

      {/* Main Container */}
      <div className={mainContainerStyle}>
        {/* Main Body */}
        <div className={mainBodyStyle}>
          {/* Left Sidebar */}
          <div className="h-full" ref={leftSidebarRef}>
            {leftSidebar}
          </div>

          {/* Main Content */}
          <div
            className={clsx(
              "flex flex-col grow min-w-0",
              gradient
                ? "bg-linear-to-b dark:from-black dark:to-layout-dark-base from-white to-layout-light-base"
                : "dark:bg-layout-dark-base bg-layout-light-base",
            )}
          >
            {/* Main Body */}
            <div className="grow min-h-0 align-middle justify-center" style={style}>
              {children}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="h-full" ref={rightSidebarRef}>
            {rightSidebar}
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="w-full" ref={bottomPanelRef}>
          {bottomPanel}
        </div>
      </div>
    </div>
  );
}

export const Layout = memo(InnerLayout);

const rootStyle = clsx(
  "absolute top-0 left-0 h-[100dvh] w-screen flex select-none",
  "dark:bg-layout-dark-base bg-layout-light-base touch-none",
  "border-t border-solid border-layout-light-separator/50 dark:border-layout-dark-separator/50",
  "divide-x divide-solid dark:divide-layout-dark-separator/50 divide-layout-light-separator/50",
);

const mainContainerStyle = clsx(
  "flex flex-col grow min-w-0 min-h-0 overflow-hidden",
  "divide-y divide-solid dark:divide-layout-dark-separator/50 divide-layout-light-separator/50",
);

const mainBodyStyle = clsx(
  "flex grow min-h-0 overflow-hidden",
  "dark:bg-layout-dark-inset bg-layout-light-inset",
);
