import { forwardRef } from "react";
import { clsx } from "clsx";
import { Variant } from "../types";

export const Arrow = forwardRef(
  (
    {
      variant,
      filled,
      className,
      ...props
    }: { filled: boolean; variant: Variant; className?: string },
    ref,
  ) => {
    console.log("Arrow component rendered", variant, filled);

    return (
      <svg
        width="10"
        height="5"
        viewBox="0 0 30 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={ref as React.RefObject<SVGSVGElement>}
        className={className}
        {...props}
      >
        {!filled && (
          <rect
            width="30"
            height="2"
            className="dark:fill-layout-dark-base fill-layout-light-base"
          />
        )}
        <path
          d="M30 0 L15 10 L0 0"
          className={clsx(
            variant,
            filled
              ? "colored-carrot-invert-fill"
              : "colored-carrot-stroke dark:fill-layout-dark-base fill-layout-light-base stroke-2",
          )}
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  },
);

Arrow.displayName = "Arrow";
