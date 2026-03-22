import { useDrag } from "@use-gesture/react";
import { clsx } from "clsx";
import { clamp } from "lodash";
import { memo } from "react";
import { Variant } from "../types";

export interface ResizerProps {
  orientation: "vertical" | "horizontal";
  invert?: boolean;
  value: number;
  onDrag: (newValue: number) => void;
  onRelease?: (newValue: number) => void;
  onDoubleClick?: () => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  showEllipses?: boolean;
  variant?: Variant;
}

function InnerResizer({
  orientation = "vertical",
  invert = false,
  onDrag,
  onRelease,
  value,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  onDoubleClick,
  disabled = false,
  showEllipses = false,
  variant,
}: ResizerProps) {
  const bind = useDrag(
    ({ down, movement: [mx, my], memo: storedValue, first }) => {
      const offset = orientation === "vertical" ? my : mx;
      const directionalOffset = invert ? -offset : offset;
      const relativeValue: number = first ? value : (storedValue ?? value);
      const newValue = clamp(
        (relativeValue + directionalOffset) as number, //typeof storedValue === "number" ? storedValue + directionalOffset : value + directionalOffset,
        min,
        max,
      );
      onDrag(newValue);
      if (down) {
        document.body.style.cursor = orientation === "vertical" ? "row-resize" : "col-resize";
      } else {
        onRelease?.(newValue);
        document.body.style.cursor = "auto";
      }
      return relativeValue;
    },
    { enabled: !disabled },
  );

  const dotClassName = clsx(
    "size-0.5 transition delay-150 rounded-full",
    "bg-neutral-700/30 dark:bg-neutral-300/30",
    "not-group-disabled/trigger:group-hover/trigger:bg-neutral-700",
    "not-group-disabled/trigger:dark:group-hover/trigger:bg-neutral-300",
  );

  return (
    <button
      type="button"
      {...bind()}
      disabled={disabled}
      onDoubleClick={onDoubleClick}
      className={clsx(
        orientation === "vertical"
          ? "not-disabled:cursor-row-resize"
          : "not-disabled:cursor-col-resize",
        orientation === "vertical" ? "w-full" : "h-full",
        orientation === "vertical" && showEllipses && "h-1 grid-cols-[1fr_auto_auto_auto_1fr]",
        orientation === "horizontal" && showEllipses && "w-1 grid-rows-[1fr_auto_auto_auto_1fr]",
        orientation === "vertical" && !showEllipses && "h-0.5",
        orientation === "horizontal" && !showEllipses && "w-0.5",
        "touch-none variant-responsive-appearing-bg transition delay-150 group/trigger",
        "grid gap-0.5 place-items-center responsive",
        variant,
      )}
    >
      {showEllipses && (
        <>
          <div />
          <div className={dotClassName} />
          <div className={dotClassName} />
          <div className={dotClassName} />
          <div />
        </>
      )}
    </button>
  );
}

/**
 * Resizer Component. Provides a singular way to attach drag handlers to a region for resizing
 * @param orientation - "vertical" or "horizontal". The direction of the drag allowed.
 * @param invert - Whether to invert the drag direction. Default is false.
 * @param value - The current recorded value. Not used visually, but grounds the values sent in handlers.
 * @param onDrag - The function to call when the drag is in progress. Receives the new value.
 * @param onRelease - The function to call when the drag is released. Receives the new value.
 * @param min - The minimum value allowed. Default is Number.NEGATIVE_INFINITY.
 * @param max - The maximum value allowed. Default is Number.POSITIVE_INFINITY.
 */
export const Resizer = memo(InnerResizer);
