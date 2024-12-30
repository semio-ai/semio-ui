import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconFileTypeModProps extends TablerIconsProps {
  className?: string;
}

const IconFileTypeMod = forwardRef(
  ({ className, ...props }: IconFileTypeModProps, ref: ForwardedRef<SVGSVGElement>) => {
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
          d="M13,4L7,4C6.451,4 6,4.451 6,5L6,12C6,12.552 5.552,13 5,13C4.448,13 4,12.552 4,12L4,5C4,3.354 5.354,2 7,2L14,2C14.271,2 14.523,2.109 14.707,2.293L19.707,7.293C19.891,7.477 20,7.729 20,8L20,12C20,12.552 19.552,13 19,13C18.448,13 18,12.552 18,12L18,9L15,9C13.903,9 13,8.097 13,7L13,4ZM16.586,7L15,5.414L15,7L16.586,7Z"
        />
        <g id="ANI">
          <path
            className="transition-[fill]"
            fill={props.color ?? "currentColor"}
            d="M17.955,13.995L18.966,13.995C20.629,13.995 21.993,15.354 21.993,17L21.993,19C21.993,20.646 20.629,22.005 18.966,22.005L17.955,22.005C17.4,22.005 16.95,21.555 16.95,21L16.95,15C16.95,14.445 17.4,13.995 17.955,13.995ZM18.96,16.005C18.96,16.005 18.96,19.995 18.96,19.995L18.966,19.995C19.52,19.995 19.982,19.549 19.982,19L19.982,17C19.982,16.451 19.52,16.005 18.966,16.005L18.96,16.005Z"
          />
          <path
            className="transition-[fill]"
            fill={props.color ?? "currentColor"}
            d="M13.49,14C14.865,14 15.98,15.115 15.98,16.49L15.98,19.51C15.98,20.885 14.865,22 13.49,22C12.115,22 11,20.885 11,19.51L11,16.49C11,15.115 12.115,14 13.49,14ZM13.49,16C13.219,16 13,16.219 13,16.49L13,19.51C13,19.781 13.219,20 13.49,20C13.761,20 13.98,19.781 13.98,19.51L13.98,16.49C13.98,16.219 13.761,16 13.49,16Z"
          />
          <path
            className="transition-[fill]"
            fill={props.color ?? "currentColor"}
            d="M5.013,21C5.013,21.552 4.565,22 4.013,22C3.461,22 3.013,21.552 3.013,21L3.013,15C3.013,14.579 3.276,14.203 3.672,14.06C4.068,13.916 4.511,14.036 4.781,14.36L6.513,16.438L8.245,14.36C8.514,14.036 8.957,13.916 9.353,14.06C9.749,14.203 10.013,14.579 10.013,15L10.013,21C10.013,21.552 9.565,22 9.013,22C8.461,22 8.013,21.552 8.013,21L8.013,17.762L7.281,18.64C7.091,18.868 6.81,19 6.513,19C6.216,19 5.935,18.868 5.745,18.64L5.013,17.762L5.013,21Z"
          />
        </g>
      </svg>
    );
  },
);

IconFileTypeMod.displayName = "IconFileTypeMod";

export { IconFileTypeMod };
