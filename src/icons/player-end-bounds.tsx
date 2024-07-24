import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

const IconPlayerEndBounds = forwardRef(
  (props: TablerIconsProps, ref: ForwardedRef<SVGSVGElement>) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("icon icon-tabler", props.className)}
        width={props.size ?? 24}
        height={props.size ?? 24}
        viewBox="0 0 24 24"
        strokeWidth={props.stroke ?? 1.5}
        stroke={props.color ?? "currentColor"}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="matrix(6.45734e-17,1.05456,-1.32388,8.10642e-17,19.667,-1.26165)">
          <path
            d="M13.632,3.166L19.171,10.822C19.304,11.006 19.304,11.231 19.171,11.414C19.038,11.598 18.793,11.71 18.527,11.71L7.448,11.71C7.182,11.71 6.937,11.598 6.804,11.414C6.671,11.231 6.671,11.006 6.803,10.822L12.343,3.166C12.476,2.983 12.721,2.87 12.987,2.87C13.253,2.87 13.499,2.983 13.632,3.166Z"
            fillRule="nonzero"
            strokeWidth="0"
            fill={props.color ?? "currentColor"}
          />
        </g>
        <g transform="matrix(3.92364e-17,-0.640779,0.810376,4.96212e-17,7.31793,28.8559)">
          <path
            d="M14.781,7.473L19.86,14.401C20.018,14.616 20.019,14.882 19.861,15.098C19.704,15.314 19.413,15.447 19.097,15.447L14.019,15.447C13.532,15.447 13.137,15.135 13.137,14.75L13.137,7.823C13.137,7.508 13.405,7.232 13.79,7.15C14.175,7.068 14.581,7.201 14.781,7.473Z"
            fillRule="nonzero"
            strokeWidth="0"
            fill={props.color ?? "currentColor"}
          />
        </g>
        <g transform="matrix(-3.92364e-17,0.640779,0.810376,4.96212e-17,7.31793,-3.98735)">
          <path
            d="M14.781,7.473L19.86,14.401C20.018,14.616 20.019,14.882 19.861,15.098C19.704,15.314 19.413,15.447 19.097,15.447L14.019,15.447C13.532,15.447 13.137,15.135 13.137,14.75L13.137,7.823C13.137,7.508 13.405,7.232 13.79,7.15C14.175,7.068 14.581,7.201 14.781,7.473Z"
            fillRule="nonzero"
            strokeWidth="0"
            fill={props.color ?? "currentColor"}
          />
        </g>
      </svg>
    );
  },
);

IconPlayerEndBounds.displayName = "IconPlayerEndBounds";

export { IconPlayerEndBounds };
