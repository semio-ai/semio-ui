import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import type { IconProps } from "@solar-icons/react-perf";

const Fast: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> = forwardRef<
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
      <g opacity="0.5">
        <path
          d="M10.656,7.18L8.703,5.751C7.644,5.022 6.344,5.97 6.344,7.471L6.344,16.529C6.344,18.03 7.644,18.978 8.703,18.249L10.656,16.82"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth="1.5px"
        />
        <path
          d="M6.344,8.178L4.34,6.712C3.444,6.095 2.344,6.898 2.344,8.168L2.344,15.832C2.344,17.102 3.444,17.905 4.34,17.288L6.344,15.822"
          fill="none"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth="1.5px"
        />
      </g>
      <path
        d="M20.735,10.147C21.963,10.954 21.963,13.045 20.735,13.853L13.317,18.73C12.123,19.515 10.656,18.493 10.656,16.877L10.656,7.123C10.656,5.507 12.123,4.485 13.317,5.27L20.735,10.147Z"
        fill="none"
        fillRule="nonzero"
        stroke="currentColor"
        strokeWidth="1.5px"
      />
    </svg>
  );
});

Fast.displayName = "Fast";

export { Fast };
