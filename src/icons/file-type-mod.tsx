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
          d="M13,4L7,4C6.451,4 6,4.452 6,5L6,19C6,19.549 6.451,20 7,20L8.694,20C9.246,20 9.694,20.448 9.694,21C9.694,21.552 9.246,22 8.694,22L7,22C5.355,22 4,20.646 4,19L4,5C4,3.355 5.355,2 7,2L14,2C14.271,2 14.523,2.109 14.707,2.293L19.707,7.293C19.891,7.477 20,7.729 20,8L20,10.731C20,11.283 19.552,11.731 19,11.731C18.448,11.731 18,11.283 18,10.731L18,9L15,9C13.902,9 13,8.098 13,7L13,4ZM16.586,7L15,5.414L15,7L16.586,7ZM13.869,21.964C11.13,21.651 9,19.322 9,16.5C9,16.369 9.005,16.24 9.014,16.111C8.983,15.926 9.004,15.732 9.082,15.552C9.531,12.968 11.788,11 14.5,11C17.536,11 20,13.464 20,16.5C20,19.536 17.536,22 14.5,22C14.414,22 14.328,21.998 14.242,21.994C14.119,22.008 13.992,21.998 13.869,21.964ZM11.171,17.582C11.536,18.705 12.454,19.58 13.603,19.884C13.797,19.482 14.039,18.894 14.207,18.194C13.042,18.151 11.988,17.877 11.171,17.582ZM15.797,19.752C16.803,19.349 17.58,18.493 17.873,17.437C17.332,17.704 16.789,17.89 16.253,18.011C16.142,18.658 15.974,19.248 15.797,19.752ZM17.747,15.191C17.371,14.261 16.608,13.53 15.658,13.196C16.096,14.109 16.306,15.028 16.367,15.906C16.829,15.744 17.292,15.511 17.747,15.191ZM13.338,13.198C12.307,13.561 11.496,14.394 11.164,15.439C11.853,15.765 13.042,16.212 14.403,16.224C14.353,15.247 14.062,14.2 13.338,13.198Z"
        />
      </svg>
    );
  },
);

IconFileTypeMod.displayName = "IconFileTypeMod";

export { IconFileTypeMod };
