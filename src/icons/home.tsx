import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconHomeProps extends TablerIconsProps {
  className?: string;
}

const IconHome = forwardRef(
  ({ className, ...props }: IconHomeProps, ref: ForwardedRef<SVGSVGElement>) => {
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
          d="M13.5,20L13.5,15L10.5,15L10.5,20.09C10.457,20.572 10.072,20.957 9.59,21L4,21C3.448,21 3,20.552 3,20L3,8.5C3,8.139 3.195,7.806 3.51,7.628C3.51,7.628 11.509,3.129 11.51,3.128C11.815,2.957 12.185,2.957 12.49,3.128C12.491,3.129 20.49,7.628 20.49,7.628C20.805,7.806 21,8.139 21,8.5L21,20C21,20.552 20.552,21 20,21L14.414,21C13.902,20.955 13.5,20.524 13.5,20ZM15.5,19L19,19L19,9.085L12,5.147L5,9.085L5,19L8.5,19L8.5,14.004C8.5,13.45 8.95,13 9.504,13L14.496,13C15.05,13 15.5,13.45 15.5,14.004L15.5,19Z"
        />
      </svg>
    );
  },
);

IconHome.displayName = "IconHome";

export { IconHome };
