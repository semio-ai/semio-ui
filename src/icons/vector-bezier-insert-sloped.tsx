import { forwardRef, type ForwardedRef } from "react";
import { type IconProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconVectorBezierInsertSlopedProps extends IconProps {
  className?: string;
}

const IconVectorBezierInsertSloped = forwardRef(
  (
    { className, ...props }: IconVectorBezierInsertSlopedProps,
    ref: ForwardedRef<SVGSVGElement>,
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={props.size ?? 24}
        height={props.size ?? 24}
        className={clsx("icon icon-tabler", className)}
        viewBox="0 0 32 32"
        version="1.1"
        strokeLinecap="round"
        style={{
          fillRule: "evenodd",
          clipRule: "evenodd",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      >
        <g id="Curve" opacity="0.5">
          <path
            className="transition-[stroke]"
            d="M29.333,13.174c-12.396,-7 -15.667,12.608 -26.667,5.674"
            fill="none"
            fillRule="nonzero"
            stroke={props.color ?? "currentColor"}
            strokeWidth={3}
          />
        </g>
        <g id="Handles">
          <path
            id="Hex"
            className="transition-[fill]"
            fill={props.color ?? "currentColor"}
            d="M16,12.265c0.41,0 3.096,1.518 3.301,1.866c0.205,0.348 0.205,3.385 0,3.733c-0.205,0.348 -2.89,1.866 -3.301,1.866c-0.41,0 -3.096,-1.518 -3.301,-1.866c-0.205,-0.348 -0.205,-3.385 0,-3.733c0.205,-0.348 2.89,-1.866 3.301,-1.866Z"
          />
          <path
            className="transition-[stroke]"
            d="M7.501,27.342l16.998,-22.684"
            fill="none"
            fillRule="nonzero"
            stroke={props.color ?? "currentColor"}
            strokeWidth={2.5}
          />
          <circle
            className="transition-[fill]"
            cx="24.499"
            cy="4.658"
            r="2.5"
            fill={props.color ?? "currentColor"}
          />
          <circle
            className="transition-[fill]"
            cx="7.501"
            cy="27.342"
            r="2.5"
            fill={props.color ?? "currentColor"}
          />
        </g>
      </svg>
    );
  },
);

IconVectorBezierInsertSloped.displayName = "IconVectorBezierInsertSloped";

export { IconVectorBezierInsertSloped };
