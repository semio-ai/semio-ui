import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { IconProps } from "@solar-icons/react-perf";

const LockOff: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> =
  forwardRef<SVGSVGElement, IconProps>((props, ref) => {
    const { alt, color = "currentColor", size = "18px", mirrored = false, ...restProps } = props;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        color={color}
        fill="none"
        viewBox="0 0 24 24"
        transform={mirrored ? "scale(-1, 1)" : undefined}
        {...restProps}
      >
        {!!alt && <title>{alt}</title>}
        <g opacity="0.7">
          <path
            d="M15.141,11L16.5,11C17.88,11 19,12.12 19,13.5L19,14.859"
            fill="none"
            fillRule="nonzero"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M18.956,18.967C18.738,20.124 17.72,21 16.5,21L7.5,21C6.12,21 5,19.88 5,18.5L5,13.5C5,12.12 6.12,11 7.5,11L10.99,11"
            fill="none"
            fillRule="nonzero"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8.78,4.639C9.511,3.648 10.686,3 12,3C14.194,3 16,4.806 16,7L16,11"
            fill="none"
            fillRule="nonzero"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeMiterlimit="4"
          />
          <path
            d="M8,11L8,8.01"
            fill="none"
            fillRule="nonzero"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeMiterlimit="4"
          />
        </g>
        <path
          d="M3,3L21,21"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeMiterlimit="4"
        />
        <path
          d="M9.5,16C9.5,17.371 10.629,18.5 12,18.5C13.371,18.5 14.5,17.371 14.5,16C14.5,14.629 13.371,13.5 12,13.5C10.629,13.5 9.5,14.629 9.5,16"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeLinecap="round"
          strokeMiterlimit="4"
        />
      </svg>
    );
  });

LockOff.displayName = "LockOff";

export { LockOff };
