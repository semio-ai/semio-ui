import { forwardRef, type ForwardedRef } from "react";
import { type IconProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconVerticalNormalizeProps extends IconProps {
  className?: string;
}

const IconVerticalNormalize = forwardRef(
  ({ className, ...props }: IconVerticalNormalizeProps, ref: ForwardedRef<SVGSVGElement>) => {
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
        <g id="Normalize">
          <g id="Ruler-2">
            <path
              id="Ruler"
              d="M9.5,4.667c-1.246,0 -1.869,0 -2.333,0.268c-0.304,0.176 -0.557,0.428 -0.732,0.732c-0.268,0.464 -0.268,1.087 -0.268,2.333l0,16c0,1.246 0,1.869 0.268,2.333c0.176,0.304 0.428,0.557 0.732,0.732c0.464,0.268 1.087,0.268 2.333,0.268c1.246,0 1.869,0 2.333,-0.268c0.304,-0.175 0.557,-0.428 0.732,-0.732c0.268,-0.464 0.268,-1.087 0.268,-2.333l0,-16c0,-1.246 0,-1.869 -0.268,-2.333c-0.176,-0.304 -0.428,-0.557 -0.732,-0.732c-0.464,-0.268 -1.087,-0.268 -2.333,-0.268Z"
              className="transition-[stroke]"
              fill="none"
              fillRule="nonzero"
              stroke={props.color ?? "currentColor"}
              strokeWidth={2}
            />
            <g id="Ticks" opacity="0.5">
              <path
                d="M6.167,16l2.333,0"
                className="transition-[stroke]"
                fill="none"
                fillRule="nonzero"
                stroke={props.color ?? "currentColor"}
                strokeWidth={2.5}
              />
              <path
                d="M6.167,12l2.333,0"
                className="transition-[stroke]"
                fill="none"
                fillRule="nonzero"
                stroke={props.color ?? "currentColor"}
                strokeWidth={2.5}
              />
              <path
                d="M6.167,8l2.333,0"
                className="transition-[stroke]"
                fill="none"
                fillRule="nonzero"
                stroke={props.color ?? "currentColor"}
                strokeWidth={2.5}
              />
              <path
                d="M6.167,20l2.333,0"
                className="transition-[stroke]"
                fill="none"
                fillRule="nonzero"
                stroke={props.color ?? "currentColor"}
                strokeWidth={2.5}
              />
              <path
                d="M6.167,24l2.333,0"
                className="transition-[stroke]"
                fill="none"
                fillRule="nonzero"
                stroke={props.color ?? "currentColor"}
                strokeWidth={2.5}
              />
            </g>
          </g>
          <g id="Ruler-1">
            <path
              id="Ruler1"
              d="M22.5,12.667c-1.246,0 -1.869,0 -2.333,0.268c-0.304,0.176 -0.557,0.428 -0.732,0.732c-0.268,0.464 -0.268,1.087 -0.268,2.333l0,8c0,1.246 0,1.869 0.268,2.333c0.176,0.304 0.428,0.557 0.732,0.732c0.464,0.268 1.087,0.268 2.333,0.268c1.246,0 1.869,0 2.333,-0.268c0.304,-0.175 0.557,-0.428 0.732,-0.732c0.268,-0.464 0.268,-1.087 0.268,-2.333l0,-8c0,-1.246 0,-1.869 -0.268,-2.333c-0.176,-0.304 -0.428,-0.557 -0.732,-0.732c-0.464,-0.268 -1.087,-0.268 -2.333,-0.268Z"
              className="transition-[stroke]"
              fill="none"
              fillRule="nonzero"
              stroke={props.color ?? "currentColor"}
              strokeWidth={2.5}
            />
            <g opacity="0.5">
              <path
                d="M19.167,16l2.333,0"
                className="transition-[stroke]"
                fill="none"
                fillRule="nonzero"
                stroke={props.color ?? "currentColor"}
                strokeWidth={2.5}
              />
              <path
                d="M19.167,20l2.333,0"
                className="transition-[stroke]"
                fill="none"
                fillRule="nonzero"
                stroke={props.color ?? "currentColor"}
                strokeWidth={2.5}
              />
              <path
                d="M19.167,24l2.333,0"
                className="transition-[stroke]"
                fill="none"
                fillRule="nonzero"
                stroke={props.color ?? "currentColor"}
                strokeWidth={2.5}
              />
            </g>
          </g>
        </g>
      </svg>
    );
  },
);

IconVerticalNormalize.displayName = "IconVerticalNormalize";

export { IconVerticalNormalize };
