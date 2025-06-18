import { forwardRef, type ForwardedRef } from "react";
import { type IconProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconPreviewViewProps extends IconProps {
  className?: string;
}

const IconPreviewView = forwardRef(
  ({ className, ...props }: IconPreviewViewProps, ref: ForwardedRef<SVGSVGElement>) => {
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
        <g transform="matrix(-1.09456,0,0,1.09456,25.1116,-1.13939)">
          <path
            className="transition-[fill]"
            fill={props.color ?? "currentColor"}
            d="M15.414,14C15.576,13.838 15.703,13.712 15.705,13.709C15.955,13.472 16.222,13.33 16.5,13.33C16.781,13.33 17.05,13.475 17.302,13.716L21,17.414L22.414,16L18.707,12.293C18.703,12.288 18.698,12.284 18.693,12.279C18.018,11.63 17.254,11.33 16.5,11.33C15.746,11.33 14.982,11.63 14.307,12.279C14.302,12.284 14.297,12.288 14.293,12.293L14,12.586L11.707,10.293C11.703,10.288 11.698,10.284 11.693,10.279C11.018,9.63 10.254,9.33 9.5,9.33C8.746,9.33 7.982,9.63 7.307,10.279C7.302,10.284 7.297,10.288 7.293,10.293L1.586,16L3,17.414L3.707,16.707C3.707,16.707 8.698,11.716 8.705,11.709C8.955,11.472 9.222,11.33 9.5,11.33C9.781,11.33 10.05,11.475 10.302,11.716L16,17.414L17.414,16L15.414,14ZM16.468,5.311C15.34,5.311 14.424,6.228 14.424,7.358C14.424,8.488 15.34,9.405 16.468,9.405C17.596,9.405 18.512,8.488 18.512,7.358C18.512,6.228 17.596,5.311 16.468,5.311Z"
          />
        </g>
      </svg>
    );
  },
);

IconPreviewView.displayName = "IconPreviewView";

export { IconPreviewView };
