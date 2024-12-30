import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconFileTypeAniProps extends TablerIconsProps {
  className?: string;
}

const IconFileTypeAni = forwardRef(
  ({ className, ...props }: IconFileTypeAniProps, ref: ForwardedRef<SVGSVGElement>) => {
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
            d="M18,15C18,14.448 18.448,14 19,14C19.552,14 20,14.448 20,15L20,21C20,21.552 19.552,22 19,22C18.448,22 18,21.552 18,21L18,15Z"
          />
          <path
            className="transition-[fill]"
            fill={props.color ?? "currentColor"}
            d="M12.429,21C12.429,21.552 11.981,22 11.429,22C10.877,22 10.429,21.552 10.429,21L10.429,15C10.429,14.562 10.714,14.176 11.131,14.045C11.549,13.915 12.003,14.072 12.252,14.432L14.568,17.788L14.566,15.01C14.566,14.458 15.014,14.01 15.565,14.01C16.117,14.009 16.566,14.457 16.566,15.009L16.571,20.999C16.571,21.437 16.287,21.824 15.869,21.955C15.451,22.085 14.997,21.928 14.748,21.568L12.429,18.209L12.429,21Z"
          />
          <path
            className="transition-[fill]"
            fill={props.color ?? "currentColor"}
            d="M4,21L4,16.5C4,15.119 5.119,14 6.5,14C7.871,14 9,15.129 9,16.5L9,21C9,21.552 8.552,22 8,22C7.448,22 7,21.552 7,21L7,19L6,19L6,21C6,21.552 5.552,22 5,22C4.448,22 4,21.552 4,21ZM6,17L7,17L7,16.5C7,16.226 6.774,16 6.5,16C6.224,16 6,16.224 6,16.5L6,17Z"
          />
        </g>
      </svg>
    );
  },
);

IconFileTypeAni.displayName = "IconFileTypeAni";

export { IconFileTypeAni };
