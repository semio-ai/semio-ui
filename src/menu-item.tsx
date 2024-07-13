import { ReactNode, forwardRef, type ForwardedRef } from "react";
import { clsx } from "clsx";
import { Variant } from "./types";
import { getReversibleBgText } from "./style-functions";

export interface MenuItemProps {
  children: ReactNode;
  variant: Variant;
}

const MenuItem = forwardRef(
  ({ children, variant }: MenuItemProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "w-10 h-10 group p-2 hover:dark:text-black hover:text-white transition-all duration-100 group",
          getReversibleBgText(variant, false),
        )}
      >
        {children}
      </div>
    );
  },
);

MenuItem.displayName = "MenuItem";

export { MenuItem };
