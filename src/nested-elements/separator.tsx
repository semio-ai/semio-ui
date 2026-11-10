import { Menu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { type NestedSeparatorProps } from "./types";

/**
 * A component that renders a separator in a nested menu.
 *
 * @param props - The props for the NestedSeparator component ({@link NestedSeparatorProps}).
 * @returns The rendered NestedSeparator component.
 */
export function NestedSeparator({ variant }: NestedSeparatorProps) {
  return (
    <Menu.Separator
      className={clsx(
        "m-1.25 h-px",
        variant,
        "variant-scope variant-separator-fill pointer-events-none select-none",
      )}
    />
  );
}
