import type { ReactNode } from "react";
import { memo } from "react";

export interface LayoutProps {
  menu: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  bottomPanel?: ReactNode;
  children: ReactNode;
}

export function InnerLayout({
  menu,
  leftSidebar,
  rightSidebar,
  bottomPanel,
  children,
}: LayoutProps) {
  // console.log("Layout Rendered");
  return (
    <div
      className="fixed h-[100dvh] w-screen flex select-none dark:bg-black bg-white"
      onScroll={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Menu */}
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
            {/* <span className="absolute top-0 bottom-0 left-0 right-0 shadow-[inset_0_0_50px_-10px_rgba(0,0,0,0.7)] pointer-events-none" /> */}
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
