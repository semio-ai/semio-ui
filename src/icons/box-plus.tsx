import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconBoxPlusProps extends TablerIconsProps {
  className?: string;
}

const IconBoxPlus = forwardRef(
  ({ className, ...props }: IconBoxPlusProps, ref: ForwardedRef<SVGSVGElement>) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("icon icon-tabler", className)}
        width={props.size ?? 24}
        height={props.size ?? 24}
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          className="transition-[fill]"
          fill={props.color ?? "currentColor"}
          d="M3,7.5C3,7.329 3.043,7.161 3.128,7.01C3.219,6.848 3.351,6.717 3.51,6.628L11.51,2.128C11.814,1.957 12.186,1.957 12.49,2.128L20.49,6.628C20.649,6.717 20.781,6.848 20.872,7.01C20.957,7.161 21,7.329 21,7.5L21,12C21,12.552 20.552,13 20,13C19.448,13 19,12.552 19,12L19,9.21L13,12.585L13,21C13,21.172 12.956,21.34 12.872,21.49C12.694,21.805 12.362,22 12,22C11.828,22 11.66,21.956 11.51,21.872L3.51,17.372C3.195,17.194 3,16.861 3,16.5L3,7.5ZM17.96,7.5L12,4.147L6.04,7.5L12,10.853L17.96,7.5ZM11,19.29L11,12.585L5,9.21L5,15.915L11,19.29Z"
        />
        <path
          className="transition-[fill]"
          fill={props.color ?? "currentColor"}
          d="M18,20L16,20C15.448,20 15,19.552 15,19C15,18.448 15.448,18 16,18L18,18L18,16C18,15.448 18.448,15 19,15C19.552,15 20,15.448 20,16L20,18L22,18C22.552,18 23,18.448 23,19C23,19.552 22.552,20 22,20L20,20L20,22C20,22.552 19.552,23 19,23C18.448,23 18,22.552 18,22L18,20Z"
        />
      </svg>
    );
  },
);

IconBoxPlus.displayName = "IconBoxPlus";

export { IconBoxPlus };
