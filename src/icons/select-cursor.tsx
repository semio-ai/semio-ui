import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { GlyphProps as IconProps } from "./_internal/glyph-props";

const SelectCursor: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> =
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
          d="M19.859,21.5L17.398,19.038L16.646,19.79C15.876,20.56 15.492,20.944 15.078,20.854C14.665,20.763 14.476,20.252 14.1,19.231L12.845,15.825C12.095,13.788 11.72,12.77 12.245,12.245C12.77,11.72 13.788,12.095 15.825,12.845L19.231,14.1C20.252,14.476 20.763,14.665 20.854,15.078C20.944,15.492 20.56,15.876 19.79,16.646L19.038,17.398L21.5,19.859C21.755,20.114 21.882,20.241 21.941,20.383C22.02,20.573 22.02,20.786 21.941,20.975C21.882,21.118 21.755,21.245 21.5,21.5C21.245,21.755 21.118,21.882 20.976,21.941C20.786,22.02 20.573,22.02 20.383,21.941C20.241,21.882 20.114,21.755 19.859,21.5Z"
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

SelectCursor.displayName = "SelectCursor";

export { SelectCursor };
