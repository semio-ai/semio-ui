import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

const IconPlayerPlay = forwardRef((props: TablerIconsProps, ref: ForwardedRef<SVGSVGElement>) => {
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
      <g transform="matrix(7.88075e-17,1.28702,-1.61571,9.89334e-17,23.7785,-4.71495)">
        <path
          d="M13.632,3.166L19.171,10.822C19.304,11.006 19.304,11.231 19.171,11.414C19.038,11.598 18.793,11.71 18.527,11.71L7.448,11.71C7.182,11.71 6.937,11.598 6.804,11.414C6.671,11.231 6.671,11.006 6.803,10.822L12.343,3.166C12.476,2.983 12.721,2.87 12.987,2.87C13.253,2.87 13.499,2.983 13.632,3.166Z"
          fillRule="nonzero"
          strokeWidth="0"
          fill={props.color ?? "currentColor"}
        />
      </g>
    </svg>
  );
});

IconPlayerPlay.displayName = "IconPlayerPlay";

export { IconPlayerPlay };
