import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconProjectProps extends TablerIconsProps {
  className?: string;
}

const IconProject = forwardRef(
  ({ className, ...props }: IconProjectProps, ref: ForwardedRef<SVGSVGElement>) => {
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
          d="M18.672,19.66C18.768,19.816 18.821,19.997 18.821,20.186C18.821,20.543 18.63,20.874 18.32,21.052L15.165,22.867C14.856,23.044 14.476,23.044 14.167,22.866L9.926,20.425L3.5,16.716C3.191,16.537 3,16.207 3,15.849L3,6.617C3,6.259 3.191,5.929 3.5,5.751L11.496,1.134C11.805,0.955 12.186,0.955 12.496,1.134L20.493,5.751C20.802,5.929 20.992,6.259 20.993,6.616L21,15.845C21,16.203 20.81,16.534 20.5,16.712C20.5,16.712 17.153,18.645 17.153,18.645L18.296,19.288C18.458,19.379 18.585,19.509 18.672,19.66ZM15.127,17.505C16.254,16.854 19,15.269 19,15.269L18.994,8.246L13,11.618L13,16.309L15.127,17.505ZM17.903,6.565L11.996,3.155L6.093,6.563L12,9.885L17.903,6.565ZM5,8.243C5,10.429 5,15.272 5,15.272L10.925,18.692L14.666,20.846L15.814,20.186L11.51,17.765C11.195,17.588 11,17.255 11,16.894L11,11.618L5,8.243Z"
        />
      </svg>
    );
  },
);

IconProject.displayName = "IconProject";

export { IconProject };
