import { clsx } from "clsx";
import { type NestedLabelProps } from "./types";

/**
 * A component that renders a nested label with optional child labels.
 *
 * @param props - The props for the NestedLabel component ({@link NestedLabelProps}).
 * @returns The rendered NestedLabel component.
 */
export function NestedLabel({ children, className }: NestedLabelProps) {
  return (
    <div
      className={clsx(
        "flex h-6 flex-row items-center pl-3.75 text-sm leading-3.75",
        "py-1.25 font-bold text-neutral-800 dark:text-neutral-200",
        "variant-scope highlight-list-item",
        className,
      )}
    >
      {children}
    </div>
  );
}
