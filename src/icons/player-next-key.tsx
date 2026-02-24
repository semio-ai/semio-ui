import { forwardRef, type ForwardedRef } from "react";
import { type IconProps } from "@tabler/icons-react";
import { clsx } from "clsx";

const IconPlayerNextKey = forwardRef((props: IconProps, ref: ForwardedRef<SVGSVGElement>) => {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("icon icon-tabler", props.className)}
      width={props.size ?? 24}
      height={props.size ?? 24}
      viewBox="0 0 24 24"
      strokeWidth={props.stroke ?? 1.5}
      stroke={props.color ?? "currentColor"}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g transform="matrix(0.66762,0,0,0.66762,6.83315,3.61992)">
        <path
          d="M16.418,4.236L22.87,7.961C23.179,8.14 23.37,8.47 23.37,8.827L23.37,16.277C23.37,16.634 23.179,16.965 22.87,17.143L16.418,20.868C16.109,21.047 15.728,21.047 15.418,20.868L8.966,17.143C8.657,16.965 8.466,16.634 8.466,16.277L8.466,8.827C8.466,8.47 8.657,8.14 8.966,7.961L15.418,4.236C15.728,4.058 16.109,4.058 16.418,4.236Z"
          fillRule="nonzero"
          strokeWidth="0"
          fill={props.color ?? "currentColor"}
        />
      </g>
      <g transform="matrix(5.48949e-17,0.896502,-1.12545,6.8914e-17,14.8026,0.348547)">
        <path
          d="M13.632,3.166L19.171,10.822C19.304,11.006 19.304,11.231 19.171,11.414C19.038,11.598 18.793,11.71 18.527,11.71L7.448,11.71C7.182,11.71 6.937,11.598 6.804,11.414C6.671,11.231 6.671,11.006 6.803,10.822L12.343,3.166C12.476,2.983 12.721,2.87 12.987,2.87C13.253,2.87 13.499,2.983 13.632,3.166Z"
          fillRule="nonzero"
          strokeWidth="0"
          fill={props.color ?? "currentColor"}
        />
      </g>
    </svg>
  );
});

IconPlayerNextKey.displayName = "IconPlayerNextKey";

export { IconPlayerNextKey };
