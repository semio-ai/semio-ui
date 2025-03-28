import { ReactNode } from "react";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "motion/react";

export interface SidebarChild {
  title: string;
  key: string;
  content: ReactNode;
}

export interface SidebarProps {
  children: SidebarChild[];
  sidebar: string | null;
  side?: "left" | "right";
}

export function Sidebar({ children, sidebar, side }: SidebarProps) {
  const child = children.find((c) => c.key === sidebar);

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {child && (
          <motion.div
            layout
            key={child.key}
            initial={{ opacity: 0, translateX: side === "left" ? -50 : 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: side === "left" ? -50 : 50 }}
            transition={{ duration: 0.1 }}
            className={clsx(
              "dark:bg-layout-darkinset bg-layout-lightinset",
              "h-full overflow-x-hidden overflow-auto",
              side === "left" && "border-r",
              side === "right" && "border-l",
              "border-solid border-layout-lightsep/50 dark:border-layout-darksep/50",
            )}
          >
            {child?.content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
