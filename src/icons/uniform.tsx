import { forwardRef, type ForwardedRef } from "react";
import { type IconProps } from "@tabler/icons-react";

export interface IconUniformProps extends IconProps {
  fillOpacity?: number;
  dashed?: boolean;
  center?: "play" | "pause";
}

const IconUniform = forwardRef(
  (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- WIP
    { fillOpacity = 1, dashed = false, center, ...props }: IconUniformProps,
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
          d="M9,17.667C9,18.219 8.552,18.667 8,18.667C7.448,18.667 7,18.219 7,17.667L7,5.333C7,4.781 7.448,4.333 8,4.333C8.552,4.333 9,4.781 9,5.333L9,17.667Z"
        />
        <path
          className="transition-[fill]"
          fill={props.color ?? "currentColor"}
          d="M17,26.667C17,27.219 16.552,27.667 16,27.667C15.448,27.667 15,27.219 15,26.667L15,11.333C15,10.781 15.448,10.333 16,10.333C16.552,10.333 17,10.781 17,11.333L17,26.667Z"
        />
        <path
          className="transition-[fill]"
          fill={props.color ?? "currentColor"}
          d="M25,17.667C25,18.219 24.552,18.667 24,18.667C23.448,18.667 23,18.219 23,17.667L23,9.333C23,8.781 23.448,8.333 24,8.333C24.552,8.333 25,8.781 25,9.333L25,17.667Z"
        />
      </svg>
    );
  },
);

IconUniform.displayName = "IconUniform";

export { IconUniform };
