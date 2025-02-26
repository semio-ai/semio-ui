import { ReactNode, forwardRef, type ForwardedRef } from "react";
import { clsx } from "clsx";
import { Variant } from "./types";

export interface MenuItemProps {
  children: ReactNode;
  variant: Variant;
  title: ReactNode;
}

const MenuItem = forwardRef(
  ({ children, title }: MenuItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "w-48 h-10 group/button p-2 transition-all duration-100",
          "hover:dark:text-neutral-400 hover:text-neutral-600",
          "flex flex-row gap-5",
          "text-neutral-500 overflow-x-hidden",
          "dark:aria-selected:text-primary-100 aria-selected:text-primary-900",
        )}
      >
        {children}
        {title}
      </div>
    );
  },
);

MenuItem.displayName = "MenuItem";

export { MenuItem };
