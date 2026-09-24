import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { GlyphProps as IconProps } from "./_internal/glyph-props";

const Lock: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> = forwardRef<
  SVGSVGElement,
  IconProps
>((props, ref) => {
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
      <path
        d="M19,13.5L19,18.5C19,19.88 17.88,21 16.5,21L7.5,21C6.12,21 5,19.88 5,18.5L5,13.5C5,12.12 6.12,11 7.5,11L16.5,11C17.88,11 19,12.12 19,13.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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
      <path
        d="M8,11L8,7C8,4.806 9.806,3 12,3C14.194,3 16,4.806 16,7L16,11"
        fill="none"
        fillRule="nonzero"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeMiterlimit="4"
      />
    </svg>
  );
});

Lock.displayName = "Lock";

export { Lock };
