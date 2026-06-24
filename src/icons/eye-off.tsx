import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { IconProps } from "@solar-icons/react-perf";

const EyeOff: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> =
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
          d="M10.585,10.587C10.21,10.962 9.999,11.471 9.999,12.001C9.999,13.098 10.902,14.001 12,14.001C12.53,14.001 13.039,13.79 13.414,13.415"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth="1.5px"
        />
        <path
          d="M16.681,16.673C15.278,17.551 13.654,18.011 12,18C8.609,18 5.751,16.226 3.425,12.677C3.156,12.269 3.155,11.741 3.422,11.332C4.586,9.549 5.886,8.214 7.32,7.326M10.18,6.18C10.779,6.059 11.389,5.998 12,6C15.39,6 18.248,7.774 20.574,11.321C20.843,11.729 20.844,12.257 20.577,12.666C20.037,13.499 19.464,14.233 18.862,14.87"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="1.5px"
        />
        <path
          d="M3,3L21,21"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth="1.5px"
        />
      </svg>
    );
  });

EyeOff.displayName = "EyeOff";

export { EyeOff };
