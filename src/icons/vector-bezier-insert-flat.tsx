import { forwardRef, type ForwardedRef } from "react";
import { clsx } from "clsx";
import type { GlyphProps as IconProps } from "./_internal/glyph-props";

export interface IconVectorBezierInsertFlatProps extends IconProps {
  className?: string;
}

const IconVectorBezierInsertFlat = forwardRef(
  (
    { className, size, color, alt, mirrored, style, ...props }: IconVectorBezierInsertFlatProps,
    ref: ForwardedRef<SVGSVGElement>,
  ) => {
    return (
      <svg
        ref={ref}
        {...props}
        transform={mirrored ? "scale(-1, 1)" : undefined}
        xmlns="http://www.w3.org/2000/svg"
        width={size ?? "18px"}
        height={size ?? "18px"}
        className={clsx("icon", className)}
        viewBox="0 0 32 32"
        version="1.1"
        strokeLinecap="round"
        style={{
          fillRule: "evenodd",
          clipRule: "evenodd",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          ...style,
        }}
      >
        {alt ? <title>{alt}</title> : null}
        <g id="Curve" opacity="0.6">
          <path
            className="transition-[stroke]"
            d="M29.333,7.276c-9.354,-0.042 -3.132,8.682 -13.333,8.722c-10.042,0.04 -1.965,8.923 -13.333,8.774"
            fill="none"
            fillRule="nonzero"
            stroke={color ?? "currentColor"}
            strokeWidth={2}
          />
        </g>
        <g id="Handles">
          <path
            id="Hex"
            className="transition-[fill]"
            fill={color ?? "currentColor"}
            d="M16,12.265c0.41,0 3.096,1.518 3.301,1.866c0.205,0.348 0.205,3.385 0,3.733c-0.205,0.348 -2.89,1.866 -3.301,1.866c-0.41,0 -3.096,-1.518 -3.301,-1.866c-0.205,-0.348 -0.205,-3.385 0,-3.733c0.205,-0.348 2.89,-1.866 3.301,-1.866Z"
          />
          <path
            d="M6.827,15.998l18.346,0"
            className="transition-[stroke]"
            fill="none"
            fillRule="nonzero"
            stroke={color ?? "currentColor"}
            strokeWidth={2}
          />
          <circle
            className="transition-[fill]"
            cx="26.5"
            cy="16"
            r="2.5"
            fill={color ?? "currentColor"}
          />
          <circle
            className="transition-[fill]"
            cx="5.5"
            cy="16"
            r="2.5"
            fill={color ?? "currentColor"}
          />
        </g>
      </svg>
    );
  },
);

IconVectorBezierInsertFlat.displayName = "IconVectorBezierInsertFlat";

export { IconVectorBezierInsertFlat };
