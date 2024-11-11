import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconGraphViewProps extends TablerIconsProps {
  className?: string;
}

const IconGraphView = forwardRef(
  ({ className, ...props }: IconGraphViewProps, ref: ForwardedRef<SVGSVGElement>) => {
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
          d="M16.173,21L15,21L15,19L16.173,19C16.589,17.84 17.704,17 19,17C20.646,17 22,18.354 22,20C22,21.646 20.646,23 19,23C17.704,23 16.589,22.16 16.173,21ZM18,20C18,20.549 18.451,21 19,21C19.549,21 20,20.549 20,20C20,19.451 19.549,19 19,19C18.451,19 18,19.451 18,20ZM7.827,5C7.411,6.16 6.296,7 5,7C3.354,7 2,5.646 2,4C2,2.354 3.354,1 5,1C6.296,1 7.411,1.84 7.827,3L9,3L9,5L7.827,5ZM6,4C6,3.451 5.549,3 5,3C4.451,3 4,3.451 4,4C4,4.549 4.451,5 5,5C5.549,5 6,4.549 6,4ZM12.396,3L12.396,5L10.017,5L10.017,3L12.396,3ZM15.792,3L15.792,5L13.413,5L13.413,3L15.792,3ZM10.587,19L10.587,21L8.208,21L8.208,19L10.587,19ZM13.983,19L13.983,21L11.604,21L11.604,19L13.983,19ZM1.981,21L1.981,19C3.898,19 5.435,18.1 6.813,16.808C8.365,15.354 9.707,13.409 11.056,11.47C12.49,9.409 13.931,7.354 15.58,5.808C17.402,4.1 19.484,3 22.019,3L22.019,5C20.102,5 18.565,5.9 17.187,7.192C15.635,8.646 14.293,10.591 12.944,12.53C11.51,14.591 10.069,16.646 8.42,18.192C6.598,19.9 4.516,21 1.981,21Z"
        />
      </svg>
    );
  },
);

IconGraphView.displayName = "IconGraphView";

export { IconGraphView };
