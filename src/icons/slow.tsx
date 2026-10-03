import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { GlyphProps as IconProps } from "./_internal/glyph-props";

const Slow: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> = forwardRef<
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
        d="M11,8.931L11,7.123C11,5.507 12.467,4.485 13.661,5.27L21.079,10.147C22.307,10.954 22.307,13.045 21.079,13.853L13.661,18.73C12.467,19.515 11,18.493 11,16.877L11,15.349"
        fill="none"
        fillRule="nonzero"
        strokeOpacity="0.6"
        stroke="currentColor"
        strokeWidth="1.5px"
      />
      <path
        d="M12.377,9.882C13.642,10.805 13.642,13.195 12.377,14.118L4.74,19.692C3.511,20.589 2,19.421 2,17.574L2,6.426C2,4.579 3.511,3.411 4.74,4.308L12.377,9.882Z"
        fill="none"
        fillRule="nonzero"
        stroke="currentColor"
        strokeWidth="1.5px"
      />
    </svg>
  );
});

Slow.displayName = "Slow";

export { Slow };
