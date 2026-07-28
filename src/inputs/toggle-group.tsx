import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ToggleGroup as RadixToggleGroup } from "radix-ui";
import { clsx } from "clsx";
import { Tooltip } from "../floating/tooltip";
import { Variant, Size } from "../types";

export interface ToggleGroupProps {
  visuals: "icons" | "labels" | "both";
  bg?: boolean;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  options: {
    label: string;
    value: string;
    disabled?: boolean;
    color?: string;
    variant?: Variant;
    icon?: ReactNode;
  }[];
  size?: Size;
  className?: string;
}

export function ToggleGroup({
  value,
  onChange,
  options,
  size,
  label,
  bg = true,
  visuals = "icons",
  className,
}: ToggleGroupProps) {
  const itemIndex = options.findIndex((option) => option.value === value);
  const activeOption = options[itemIndex];

  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);

  // Track the active item's box so the highlight pill can sit exactly behind it.
  //
  // Three things made the old version wrong, and a `labels` group showed all of
  // them at once as a pill clipping the label it was supposed to sit behind:
  //
  // 1. The item was located through a ref callback on `RadixToggleGroup.Item`,
  //    which `Tooltip` wraps (`Trigger asChild`). Each item is re-queried by
  //    `data-toggle-item` instead, so a trigger that re-renders and swaps its
  //    DOM node can't leave us measuring a detached element.
  // 2. Measuring once on mount plus window `resize` missed the webfont swap,
  //    which changes text metrics without resizing anything. The observer is on
  //    the ROOT — stable across item re-renders, and it resizes whenever an item
  //    does, since the track is inline-flex.
  // 3. `width` was animated. Interrupting that animation (any re-render during
  //    the 200ms) left the pill stranded at its start value, so it is applied as
  //    a plain style now and only `x` animates — which is the slide the control
  //    actually wants.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const item = root.querySelector<HTMLElement>(`[data-toggle-item="${CSS.escape(value)}"]`);
      if (!item) return;
      setLeft(item.offsetLeft);
      setWidth(item.clientWidth);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(root);

    // Fonts land after first paint and change text metrics; `document.fonts`
    // is the signal for exactly that, and is absent in some test environments.
    void document.fonts?.ready.then(measure).catch(() => undefined);

    return () => observer.disconnect();
  }, [value, visuals, size, options.length]);

  return (
    <RadixToggleGroup.Root
      ref={rootRef}
      className={clsx(
        "relative inline-flex items-center overflow-hidden rounded-sm transition-all ",
        bg && "dark:bg-layout-dark-base bg-layout-light-base",
        className,
      )}
      type="single"
      value={value}
      onValueChange={(v: string) => {
        if (v) onChange(v);
      }}
      aria-label={label ?? "Toggle Group"}
    >
      {/* The highlight pill. Position and size are plain styles with a CSS
          transition, NOT a JS animation: as a motion element with `initial`,
          every re-render of this subtree restarted the tween from its start
          value, so the pill sat permanently stranded a few percent along —
          behind the wrong item, at the wrong width. Declaring the resolved
          geometry means the pill is correct on the very first paint and slides
          only when it can, instead of depending on an animation completing. */}
      <div
        aria-hidden
        style={{
          ...(activeOption?.color
            ? ({ "--custom-color": activeOption.color } as CSSProperties)
            : undefined),
          transform: `translateX(${left.toString()}px)`,
          // Until the first measurement lands, keep the class's own width rather
          // than collapsing to zero.
          ...(width > 0 ? { width } : undefined),
        }}
        className={clsx(
          activeOption?.color ? "custom-color" : activeOption?.variant,
          size,
          "absolute left-0",
          "sized-inner-group-item rounded-xs",
          "responsive bg-(--accent-color)",
          // Only transition once measured, so the pill appears in place instead
          // of sliding in from the left edge on first paint.
          width > 0 &&
            "transition-[transform,width] duration-200 ease-in-out motion-reduce:transition-none",
        )}
      />
      <div className="z-1 inline-flex items-center justify-center p-0.5">
        {options.map((option) => (
          <Tooltip
            key={option.value}
            disabled={option.disabled}
            content={option.label ?? "Option"}
            variant={option?.variant}
          >
            <RadixToggleGroup.Item
              key={option.value}
              // The highlight pill measures the active item by this attribute
              // rather than through a collected ref — see the measuring effect.
              data-toggle-item={option.value}
              data-state={value === option.value ? "on" : "off"}
              className={clsx(
                "responsive",
                size,
                option.color ? "custom-color" : option.variant,
                visuals === "icons" && "sized-inner-group-item",
                "sized-inner-group-item-height",
                "grid place-items-center transition-colors",
                (visuals === "icons" || visuals === "labels") && "grid-cols-1 grid-rows-1",
                visuals === "both" && "grid-cols-[auto_auto] grid-rows-1",
                value === option.value ? "text-white dark:text-black" : "variant-responsive-text",
              )}
              style={
                option.color
                  ? ({
                      "--custom-color": option.color,
                    } as any)
                  : {}
              }
              value={option.value}
              disabled={option.disabled}
              aria-label={option.label}
            >
              {(visuals === "icons" || visuals === "both") && (
                <p className="sized-inner-group-item grid place-items-center">{option.icon}</p>
              )}
              {(visuals === "labels" || visuals === "both") && (
                <p className={clsx("text-nowrap", visuals === "both" ? "pr-2" : "px-2")}>
                  {option.label}
                </p>
              )}
            </RadixToggleGroup.Item>
          </Tooltip>
        ))}
      </div>
    </RadixToggleGroup.Root>
  );
}
