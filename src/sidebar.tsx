import { ReactNode } from "react";
import { clsx } from "clsx";
import { Transition } from "@headlessui/react";
import { ResizableDiv } from "./resizable-div";
// import { ScrollArea } from "./scroll-area";

export interface SidebarChild {
  title: string;
  key: string;
  content: ReactNode;
}

export interface SidebarProps {
  children: SidebarChild[];
  sidebar: string | null;
}

export function Sidebar({ children, sidebar }: SidebarProps) {
  return (
    <div
      className={clsx(
        "dark:bg-neutral-800 bg-neutral-200 transition-all duration-150 h-full overflow-x-hidden overflow-auto",
        sidebar !== null ? "w-auto" : "w-0",
      )}
    >
      <ResizableDiv>
        {/* <div className="grow justify-items-center"> */}
          <div className="flex grow">
            {/* Test Div */}
          {children.map((child) => (
            <Transition
              key={child.key}
              show={sidebar === child.key}
              unmount={false}
            >
              <div
                className={clsx(
                  // Base styles
                  "block w-full h-full transition-all ease-in-out",
                  // Shared closed styles
                  "data-[closed]:opacity-0",
                  // Duration
                  "duration-50 data-[enter]:data-[closed]:delay-50",
                  // Shared transition styles
                  "data-[transition]:opacity-0",
                  // Entering styles
                  // // If the index of the current sidebar is less than this, then we are entering from the top
                  // sidebar !== null &&
                  //   children.findIndex((c) => c.key === sidebar) > index &&
                  //   "data-[transition]:-translate-y-8",
                  // // If the index of the current sidebar is greater than this, then we are entering from the bottom
                  // sidebar !== null &&
                  //   children.findIndex((c) => c.key === sidebar) < index &&
                  //   "data-[transition]:translate-y-8",
                )}
              >

                  {child.content}
                </div>
              </Transition>
            ))}
          </div>
          {/* </div> */}
      </ResizableDiv>
    </div>
  );
}
