import { forwardRef, type ForwardedRef } from "react";
import { type IconProps } from "@tabler/icons-react";

export interface IconNormalizedProps extends IconProps {
  fillOpacity?: number;
  dashed?: boolean;
  center?: "play" | "pause";
}

const IconNormalized = forwardRef(
  (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- WIP
    { fillOpacity = 1, dashed = false, center, ...props }: IconNormalizedProps,
    ref: ForwardedRef<SVGSVGElement>,
  ) => {
    return (
      <svg
        ref={ref}
        width={props.size ?? 24}
        height={props.size ?? 24}
        viewBox="0 0 32 32"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        fill={props.color ?? "currentColor"}
        stroke="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          className="transition-[fill]"
          fill={props.color ?? "currentColor"}
          d="M9,26.667C9,27.219 8.552,27.667 8,27.667C7.448,27.667 7,27.219 7,26.667L7,5.333C7,4.781 7.448,4.333 8,4.333C8.552,4.333 9,4.781 9,5.333L9,26.667Z"
        />
        <path
          className="transition-[fill]"
          fill={props.color ?? "currentColor"}
          d="M17,26.667C17,27.219 16.552,27.667 16,27.667C15.448,27.667 15,27.219 15,26.667L15,5.333C15,4.781 15.448,4.333 16,4.333C16.552,4.333 17,4.781 17,5.333L17,26.667Z"
        />
        <path
          className="transition-[fill]"
          fill={props.color ?? "currentColor"}
          d="M25,26.667C25,27.219 24.552,27.667 24,27.667C23.448,27.667 23,27.219 23,26.667L23,5.333C23,4.781 23.448,4.333 24,4.333C24.552,4.333 25,4.781 25,5.333L25,26.667Z"
        />
      </svg>
    );
  },
);

IconNormalized.displayName = "IconNormalized";

export { IconNormalized };
