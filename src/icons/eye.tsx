import { forwardRef, type RefAttributes } from "react";
import type { IconProps } from "@solar-icons/react-perf";

const Eye: React.ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> = forwardRef<
  SVGSVGElement,
  IconProps
>((props, ref) => {
  const { alt, color = "currentColor", size = "1em", mirrored = false, ...restProps } = props;

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
        d="M10,12C10,13.097 10.903,14 12,14C13.097,14 14,13.097 14,12C14,10.903 13.097,10 12,10C10.903,10 10,10.903 10,12"
        fill="none"
        fillRule="nonzero"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.5px"
      />
      <path
        d="M3.408,11.348C3.408,11.347 3.409,11.346 3.409,11.346C5.738,7.782 8.602,6 12,6C15.398,6 18.262,7.782 20.591,11.346C20.591,11.346 20.592,11.347 20.592,11.348C20.85,11.744 20.851,12.254 20.593,12.65C20.592,12.652 20.591,12.653 20.591,12.654C18.262,16.218 15.398,18 12,18C8.602,18 5.738,16.218 3.409,12.654C3.409,12.653 3.408,12.652 3.407,12.65C3.149,12.254 3.15,11.744 3.408,11.348Z"
        fill="none"
        fillRule="nonzero"
        stroke="currentColor"
        strokeWidth="1.5px"
      />
    </svg>
  );
});

Eye.displayName = "Eye";

export { Eye };
