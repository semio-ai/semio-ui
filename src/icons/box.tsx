import { forwardRef, type ForwardedRef } from "react";
import { type IconProps } from "@tabler/icons-react";
import { clsx } from "clsx";

const IconBox = forwardRef(
  ({ className, ...props }: IconProps, ref: ForwardedRef<SVGSVGElement>) => {
    <IconBox />;
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
          d="M3,7.5C3,7.329 3.043,7.161 3.128,7.01C3.219,6.848 3.351,6.717 3.51,6.628L11.51,2.128C11.815,1.957 12.185,1.957 12.49,2.128L20.49,6.628C20.649,6.717 20.781,6.848 20.872,7.01C20.957,7.161 21,7.329 21,7.5L21,16.5C21,16.861 20.805,17.194 20.49,17.372L12.49,21.872C12.342,21.955 12.174,22 12,22C11.826,22 11.658,21.955 11.51,21.872L3.51,17.372C3.195,17.194 3,16.861 3,16.5L3,7.5ZM17.96,7.5L12,4.147L6.04,7.5L12,10.853L17.96,7.5ZM13,19.29L19,15.915L19,9.21L13,12.585L13,19.29ZM5,9.21L5,15.915L11,19.29L11,12.585L5,9.21Z"
        />
      </svg>
    );
  },
);

IconBox.displayName = "IconBox";

export { IconBox };
