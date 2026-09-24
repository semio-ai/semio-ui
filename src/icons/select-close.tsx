import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { GlyphProps as IconProps } from "./_internal/glyph-props";

const SelectClose: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> =
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
        <path
          d="M22,22L16,16M22,16L16,22"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth={1.5}
        />
        <path
          d="M12,22C7.286,22 4.929,22 3.465,20.535C2,19.071 2,16.714 2,12C2,7.286 2,4.929 3.465,3.464C4.929,2 7.286,2 12,2C16.714,2 19.071,2 20.536,3.464C22,4.929 22,8.286 22,13"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeOpacity={0.5}
          strokeLinecap="round"
          strokeMiterlimit={1.5}
          strokeDasharray="2.25,3,0,0,0,0"
        />
      </svg>
    );
  });

SelectClose.displayName = "SelectClose";

export { SelectClose };
