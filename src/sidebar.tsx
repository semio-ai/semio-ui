import { ReactNode } from "react";
import { clsx } from "clsx";
import { Transition } from "@headlessui/react";

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
        "dark:bg-neutral-900 bg-neutral-100 transition-all duration-150 h-full flex-shrink-0 overflow-x-hidden overflow-y-scroll",
        sidebar !== null ? "w-52" : "w-0",
      )}
    >
      {children.map((child, index) => (
        <Transition
          key={child.key}
          show={sidebar === child.key}
          unmount={false}
        >
          <div
            className={clsx(
              // Base styles
              "block w-52 h-full transition-all ease-in-out",
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
  );
}
