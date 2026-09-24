import { useMemo } from "react";
import { Progress as RadixProgress } from "radix-ui";
import { MotionValue, motion, useTransform } from "motion/react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";
import { resolveIcon, type IconValue } from "../icons/registry";

export interface ProgressProps {
  progress: number;
  variant?: Variant;
  size?: Size;
}

export function Progress({ progress, variant, size }: ProgressProps) {
  return (
    <RadixProgress.Root
      className={clsx(
        size,
        variant,
        "variant-scope sized-progress-height variant-static-bg-50 relative w-full translate-z-0 overflow-hidden rounded-sm",
      )}
      value={progress}
    >
      <RadixProgress.Indicator
        style={{ width: `${(progress * 100).toString()}%` }}
        className={clsx(variant, "variant-static-bg h-full duration-200 ease-in-out")}
      />
    </RadixProgress.Root>
  );
}

export interface ProgressCircleProps {
  progress: number | MotionValue<number>;
  variant?: Variant;
  size?: Size;
  icon?: IconValue;
}

const progressToOffset = (progress: number) => {
  const clamped = Math.min(Math.max(progress, 0), 1); // Clamp between 0 and 1
  return 2 * Math.PI * 4 * (1 - clamped);
};

export function ProgressCircle({ size, progress, variant, icon }: ProgressCircleProps) {
  const progressValue = useMemo(
    () => (typeof progress === "number" ? new MotionValue(progress) : progress),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Want to prevent rerenders when the progress value changes
    [],
  );

  const strokeDashoffset: MotionValue<number> = useTransform(progressValue, progressToOffset);

  return (
    <div
      className={clsx(
        size,
        variant,
        "sized-height sized-width",
        "variant-static-text",
        "variant-scope relative",
      )}
    >
      <svg width="100%" height="100%" viewBox="0 0 10 10">
        <g transform="translate(5,5) rotate(-90)">
          <circle
            cx={0}
            cy={0}
            r={4}
            strokeWidth={1}
            opacity={0.5}
            stroke="currentColor"
            className="fill-transparent"
          />
          <motion.circle
            cx={0}
            cy={0}
            r={4}
            strokeWidth={1}
            fill="transparent"
            stroke="currentColor"
            strokeDasharray={2 * Math.PI * 4}
            style={typeof progress === "number" ? undefined : { strokeDashoffset }}
            animate={
              typeof progress === "number"
                ? { strokeDashoffset: progressToOffset(progress) }
                : undefined
            }
            strokeLinecap="round"
            initial={false}
            transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
          />
        </g>
      </svg>
      {icon && (
        <div className="absolute top-[10%] right-[10%] bottom-[10%] left-[10%] grid place-items-center">
          {resolveIcon(icon)}
        </div>
      )}
    </div>
  );
}
