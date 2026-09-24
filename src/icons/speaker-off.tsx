import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { GlyphProps as IconProps } from "./_internal/glyph-props";

const SpeakerOff: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> =
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
          d="M15.371,15.486C15.249,17.923 15.108,19.198 14.28,19.78C14.103,19.904 13.905,20.005 13.7,20.075C12.633,20.439 11.361,19.601 8.818,17.924L8.599,17.78C8.172,17.498 7.958,17.357 7.728,17.255C7.5,17.155 7.261,17.083 7.016,17.042C6.768,17 6.512,17 6,17C4.626,17 3.939,17 3.34,16.723C2.792,16.469 2.245,15.954 1.959,15.423C1.645,14.841 1.608,14.237 1.535,13.028C1.513,12.671 1.5,12.322 1.5,12C1.5,11.677 1.513,11.329 1.535,10.971C1.608,9.763 1.645,9.158 1.959,8.577C2.245,8.046 2.792,7.53 3.34,7.277C3.939,7 4.626,7 6,7C6.499,7 6.598,7.003 7,7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
        <path
          d="M9.555,5.591C11.618,4.241 12.741,3.598 13.7,3.925C13.905,3.995 14.103,4.096 14.28,4.22C15.202,4.868 15.273,6.377 15.413,9.394C15.452,10.234 15.481,10.983 15.494,11.529"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
        <path
          d="M20,6C20,6 21.5,7.8 21.5,12C21.5,14.119 21.118,15.627 20.74,16.602"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
        <path
          d="M18,9C18,9 18.5,9.9 18.5,12C18.5,12.991 18.389,13.715 18.271,14.203"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
        <path
          d="M3,3L21,21"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  });

SpeakerOff.displayName = "SpeakerOff";

export { SpeakerOff };
