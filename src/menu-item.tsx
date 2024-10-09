import { ReactNode, forwardRef, type ForwardedRef } from "react";
import { clsx } from "clsx";
import { Variant } from "./types";
import { Tooltip } from "./tooltip";
import { getReversibleBgText } from "./style-functions";

export interface MenuItemProps {
  children: ReactNode;
  variant: Variant;
  title: string;
}

const MenuItem = forwardRef(
  ({ children, variant, title }: MenuItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <Tooltip content={title} variant={variant} side="left">
        <div
          ref={ref}
          className={clsx(
            "w-10 h-10 group p-2 hover:dark:text-black hover:text-white transition-all duration-100 group",
            getReversibleBgText(variant, false),
          )}
        >
          {children}
        </div>
      </Tooltip>
    );
  },
);

MenuItem.displayName = "MenuItem";

export { MenuItem };
