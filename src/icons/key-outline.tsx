import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

const IconKeyOutline = forwardRef(
  (props: TablerIconsProps, ref: ForwardedRef<SVGSVGElement>) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("icon icon-tabler", props.className)}
        width={props.size ?? 24}
        height={props.size ?? 24}
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="matrix(1.34793,0,0,1.35605,-9.45666,-5.02135)">
          <path
            d="M16.418,4.236L22.87,7.961C23.179,8.14 23.37,8.47 23.37,8.827L23.37,16.277C23.37,16.634 23.179,16.965 22.87,17.143L16.418,20.868C16.109,21.047 15.728,21.047 15.418,20.868L8.966,17.143C8.657,16.965 8.466,16.634 8.466,16.277L8.466,8.827C8.466,8.47 8.657,8.14 8.966,7.961L15.418,4.236C15.728,4.058 16.109,4.058 16.418,4.236ZM16.307,6.086C16.066,5.947 15.77,5.947 15.529,6.086L10.512,8.982C10.272,9.121 10.124,9.378 10.124,9.656L10.124,15.449C10.124,15.727 10.272,15.983 10.512,16.122L15.529,19.019C15.77,19.158 16.066,19.158 16.307,19.019L21.324,16.122C21.565,15.983 21.713,15.727 21.713,15.449L21.713,9.656C21.713,9.378 21.565,9.121 21.324,8.982L16.307,6.086Z"
            fillRule="nonzero"
            strokeWidth="0"
            fill={props.color ?? "currentColor"}
          />
        </g>
      </svg>
    );
  },
);

IconKeyOutline.displayName = "IconKeyOutline";

export { IconKeyOutline };
