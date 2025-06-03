import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconFileTypeFaceProps extends TablerIconsProps {
  className?: string;
}

const IconFileTypeFace = forwardRef(
  ({ className, ...props }: IconFileTypeFaceProps, ref: ForwardedRef<SVGSVGElement>) => {
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
          d="M13,4L7,4C6.451,4 6,4.452 6,5L6,19C6,19.549 6.451,20 7,20L8,20C8.552,20 9,20.448 9,21C9,21.552 8.552,22 8,22L7,22C5.355,22 4,20.646 4,19L4,5C4,3.355 5.355,2 7,2L14,2C14.271,2 14.523,2.109 14.707,2.293L19.707,7.293C19.891,7.477 20,7.729 20,8L20,10C20,10.552 19.552,11 19,11C18.448,11 18,10.552 18,10L18,9L15,9C13.902,9 13,8.098 13,7L13,4ZM16.586,7L15,5.414L15,7L16.586,7ZM20,14.25L20,18.75C20,20.544 18.544,22 16.75,22L12.25,22C10.456,22 9,20.544 9,18.75L9,14.25C9,12.456 10.456,11 12.25,11L16.75,11C18.544,11 20,12.456 20,14.25ZM18,14.25C18,13.56 17.44,13 16.75,13L12.25,13C11.56,13 11,13.56 11,14.25L11,18.75C11,19.44 11.56,20 12.25,20L16.75,20C17.44,20 18,19.44 18,18.75L18,14.25ZM16,14C16.552,14 17,14.448 17,15C17,15.552 16.552,16 16,16C15.448,16 15,15.552 15,15C15,14.448 15.448,14 16,14ZM12.646,18.354C12.451,18.158 12.451,17.842 12.646,17.646C12.842,17.451 13.158,17.451 13.354,17.646C13.74,18.033 14.114,18.25 14.5,18.25C14.886,18.25 15.26,18.033 15.646,17.646C15.842,17.451 16.158,17.451 16.354,17.646C16.549,17.842 16.549,18.158 16.354,18.354C15.74,18.967 15.114,19.25 14.5,19.25C13.886,19.25 13.26,18.967 12.646,18.354ZM13,14C13.552,14 14,14.448 14,15C14,15.552 13.552,16 13,16C12.448,16 12,15.552 12,15C12,14.448 12.448,14 13,14Z"
        />
      </svg>
    );
  },
);

IconFileTypeFace.displayName = "IconFileTypeFace";

export { IconFileTypeFace };
