import { forwardRef, type ForwardedRef } from "react";
import { type TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";

export interface IconPlayPauseProps extends TablerIconsProps {
  fillOpacity?: number;
  dashed?: boolean;
  center?: "play" | "pause";
}

const IconPlayPause = forwardRef(
  (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- WIP
    { fillOpacity = 1, dashed = false, center, ...props }: IconPlayPauseProps,
    ref: ForwardedRef<SVGSVGElement>,
  ) => {
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
        <g id="play-circle2" transform="matrix(0.93611,0,0,0.93611,0.766682,0.766682)">
          {/* Solid Border */}
          <g id="outline" transform="matrix(1.06825,0,0,1.06825,-0.819009,-0.819009)">
            <path
              d="M12,1.955C17.544,1.955 22.045,6.456 22.045,12C22.045,17.544 17.544,22.045 12,22.045C6.456,22.045 1.955,17.544 1.955,12C1.955,6.456 6.456,1.955 12,1.955ZM12,3.917C7.539,3.917 3.917,7.539 3.917,12C3.917,16.461 7.539,20.083 12,20.083C16.461,20.083 20.083,16.461 20.083,12C20.083,7.539 16.461,3.917 12,3.917Z"
              fillRule="nonzero"
              strokeWidth="0"
              fill={props.color ?? "currentColor"}
              className="transition-[fill-opacity]"
            />
          </g>

          {/* Fill */}
          <g id="ellipse" transform="matrix(1,0,0,1,0.293126,0.0672761)">
            <circle
              cx="11.707"
              cy="11.933"
              r="9.873"
              fillRule="nonzero"
              strokeWidth="0"
              fill={props.color ?? "currentColor"}
              fillOpacity={fillOpacity}
              className="transition-[fill-opacity]"
            />
          </g>

          {/* Pause Icon */}
          <g id="pause" transform="matrix(1.10123,0,0,1.38238,-4.90083,-5.07058)">
            <path
              d="M14.197,8.368L14.197,16.329C14.197,16.595 13.926,16.811 13.592,16.811L12.136,16.811C11.802,16.811 11.531,16.595 11.531,16.329L11.531,8.368C11.531,8.102 11.802,7.886 12.136,7.886L13.592,7.886C13.926,7.886 14.197,8.102 14.197,8.368ZM19.145,8.368L19.145,16.329C19.145,16.595 18.874,16.811 18.539,16.811L17.084,16.811C16.75,16.811 16.478,16.595 16.478,16.329L16.478,8.368C16.478,8.102 16.75,7.886 17.084,7.886L18.539,7.886C18.874,7.886 19.145,8.102 19.145,8.368Z"
              fillRule="nonzero"
              strokeWidth="0"
              fill={props.color ?? "currentColor"}
              fillOpacity={center === "pause" ? 1 : 0}
              className="transition-[fill-opacity]"
            />
          </g>

          {/* Play Icon */}
          <g
            id="arrow"
            transform="matrix(6.01214e-17,0.981856,-1.2326,7.54752e-17,22.2313,-0.751646)"
          >
            <path
              d="M13.632,3.166L19.171,10.822C19.304,11.006 19.304,11.231 19.171,11.414C19.038,11.598 18.793,11.71 18.527,11.71L7.448,11.71C7.182,11.71 6.937,11.598 6.804,11.414C6.671,11.231 6.671,11.006 6.803,10.822L12.343,3.166C12.476,2.983 12.721,2.87 12.987,2.87C13.253,2.87 13.499,2.983 13.632,3.166Z"
              fillRule="nonzero"
              strokeWidth="0"
              fill={props.color ?? "currentColor"}
              fillOpacity={center === "play" ? 1 : 0}
              className="transition-[fill-opacity]"
            />
          </g>
        </g>
      </svg>
    );
  },
);

IconPlayPause.displayName = "IconPlayPause";

export { IconPlayPause };
