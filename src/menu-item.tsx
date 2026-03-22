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
          "group/button h-10 w-48 p-2 transition-all duration-100",
          "hover:text-neutral-600 dark:hover:text-neutral-400",
          "flex flex-row gap-5",
          "overflow-x-hidden text-neutral-500",
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
