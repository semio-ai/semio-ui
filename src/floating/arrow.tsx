import { type CSSProperties, type Ref } from "react";
import { clsx } from "clsx";
import { Variant } from "../types";

export interface ArrowProps {
  filled: boolean;
  variant: Variant;
  className?: string;
  color?: string;
  /** React 19+: `ref` arrives as an ordinary prop. Not supported on React 18. */
  ref?: Ref<SVGSVGElement>;
}

export function Arrow({ variant, filled, className, color, ref, ...props }: ArrowProps) {
  return (
    <svg
      width="10"
      height="5"
      viewBox="0 0 30 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      className={className}
      {...props}
    >
      <path
        d="M30 0 L15 9 L0 0"
        style={{ "--custom-color": color } as CSSProperties}
        className={clsx(
          "variant-scope",
          color ? "custom-color" : variant,
          filled
            ? "colored-carrot-invert-fill"
            : "dark:fill-layout-dark-deep-inset fill-layout-light-deep-inset",
        )}
      />
    </svg>
  );
}
