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
  return (
    <div
      className="fixed h-screen w-screen flex select-none dark:bg-black bg-white"
      onScroll={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Menu */}
      {menu}

      {/* Main Container */}
      <div className="flex flex-col flex-grow min-w-0 min-h-0 overflow-hidden">
        {/* Main Body */}
        <div className="flex flex-grow min-h-0 overflow-hidden">
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
