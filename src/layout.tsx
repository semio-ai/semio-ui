import type { MutableRefObject, ReactNode } from "react";
import { memo, useRef } from "react";
import { useGesture } from "@use-gesture/react";

export interface LayoutProps {
  menu: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  bottomPanel?: ReactNode;
  children: ReactNode;
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
    <div
      ref={root as MutableRefObject<HTMLDivElement>}
      className="absolute top-0 left-0 h-[100dvh] w-screen flex select-none dark:bg-black bg-white touch-none"
    >
      {/* Menu (thin left bar)*/}
      {menu}

      {/* Main Container */}
      <div className="flex flex-col flex-grow min-w-0 min-h-0 overflow-hidden divide-y divide-solid dark:divide-neutral-900/30 divide-neutral-100/30">
        {/* Main Body */}
        <div className="flex flex-grow min-h-0 overflow-hidden divide-x divide-solid dark:divide-neutral-900/30 divide-neutral-100/30 dark:bg-neutral-800 bg-neutral-200">
          {/* Left Sidebar */}
          {leftSidebar}

          {/* Main Content */}
          <div className="flex flex-col flex-grow min-w-0">
            {/* Main Body */}
            <div className="flex-grow min-h-0 dark:bg-[#303030] bg-[#dddddd] align-middle justify-center">
              {children}
            </div>
          </div>

          {/* Right Sidebar */}
          {rightSidebar}
        </div>

        {/* Bottom Panel */}
        {bottomPanel}
      </div>
    </div>
  );
}

export const Layout = memo(InnerLayout);
