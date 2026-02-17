import { forwardRef, type ForwardedRef } from "react";
import { type IconProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconGraphViewProps extends IconProps {
  className?: string;
}

const IconGraphView = forwardRef(
  ({ className, ...props }: IconGraphViewProps, ref: ForwardedRef<SVGSVGElement>) => {
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
        <path
          className="transition-[stroke]"
          d="M2.667,16c0,-6.285 0,-9.428 1.953,-11.381c1.953,-1.953 5.095,-1.953 11.381,-1.953c6.285,0 9.428,0 11.381,1.953c1.953,1.953 1.953,5.095 1.953,11.381c0,6.285 0,9.428 -1.953,11.381c-1.953,1.953 -5.095,1.953 -11.381,1.953c-6.285,0 -9.428,0 -11.381,-1.953c-1.953,-1.953 -1.953,-5.095 -1.953,-11.381Z"
          fill="none"
          fillRule="nonzero"
          stroke={props.color ?? "currentColor"}
          strokeWidth={3}
        />
        <g opacity="0.5">
          <path
            className="transition-[stroke]"
            d="M12,2.667l0,26.667"
            fill="none"
            fillRule="nonzero"
            stroke={props.color ?? "currentColor"}
            strokeWidth={3}
          />
          <path
            className="transition-[stroke]"
            d="M2.667,12.667l26.667,-0.333"
            fill="none"
            fillRule="nonzero"
            stroke={props.color ?? "currentColor"}
            strokeWidth={3}
          />
        </g>
      </svg>
    );
  },
);

IconGraphView.displayName = "IconGraphView";

export { IconGraphView };
