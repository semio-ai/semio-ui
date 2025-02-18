import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconFilterXProps extends TablerIconsProps {
  className?: string;
}

const IconFilterX = forwardRef(
  ({ className, ...props }: IconFilterXProps, ref: ForwardedRef<SVGSVGElement>) => {
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
          d="M11.684,19.051C12.207,18.877 12.774,19.16 12.949,19.684C13.123,20.207 12.84,20.774 12.316,20.949L9.316,21.949C9.011,22.05 8.676,21.999 8.415,21.811C8.155,21.623 8,21.321 8,21L8,12.887L3.78,8.245C3.278,7.693 3,6.973 3,6.227L3,4C3,3.448 3.448,3 4,3L20,3C20.552,3 21,3.448 21,4L21,6.172C21,6.967 20.683,7.731 20.121,8.293L15.707,12.707C15.317,13.097 14.683,13.097 14.293,12.707C13.903,12.317 13.903,11.683 14.293,11.293L18.707,6.879C18.894,6.691 19,6.437 19,6.172L19,5C19,5 5,5 5,5L5,6.227C5,6.476 5.093,6.715 5.26,6.899L9.74,11.827C9.907,12.011 10,12.251 10,12.5L10,19.613L11.684,19.051ZM16.803,18L14.651,15.849C14.183,15.38 14.183,14.62 14.651,14.151C15.12,13.683 15.88,13.683 16.349,14.151L18.5,16.303L20.651,14.151C21.12,13.683 21.88,13.683 22.349,14.151C22.817,14.62 22.817,15.38 22.349,15.849L20.197,18L22.349,20.151C22.817,20.62 22.817,21.38 22.349,21.849C21.88,22.317 21.12,22.317 20.651,21.849L18.5,19.697L16.349,21.849C15.88,22.317 15.12,22.317 14.651,21.849C14.183,21.38 14.183,20.62 14.651,20.151L16.803,18Z"
        />
      </svg>
    );
  },
);

IconFilterX.displayName = "IconFilterX";

export { IconFilterX };
