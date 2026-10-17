import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import { clsx } from "clsx";
import { Tooltip } from "../floating/tooltip";
import { Variant, Size } from "../types";
import { resolveIcon, type IconValue } from "../icons/registry";

// `useLayoutEffect` is the right primitive for measuring layout before paint, but
// React warns when it runs where there is no DOM. `@semio/ui` is published, so a
// consumer may render on a server, and this package's own `unit` test project
// renders through `renderToStaticMarkup` in node.
const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

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
    icon?: IconValue;
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

  // Measure the live item by attribute because tooltip triggers can replace their
  // DOM nodes. Observe the track to include font swaps and option size changes.
  // Apply width directly and animate only resolved geometry, before first paint.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const item = root.querySelector<HTMLElement>(`[data-toggle-item="${CSS.escape(value)}"]`);
      if (!item) {
        // Nothing matches `value` — options swapped out from under it, or the
        // value arrived stale from a URL. Clearing the width both hides the pill
        // and drops the old geometry, so a later valid value cannot be preceded
        // by a frame at the previous item's position.
        setWidth(0);
        return;
      }
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
    <BaseToggleGroup
      ref={rootRef}
      className={clsx(
        "relative inline-flex items-center overflow-hidden rounded-sm transition-all ",
        bg && "dark:bg-layout-dark-base bg-layout-light-base",
        className,
      )}
      value={value ? [value] : []}
      onValueChange={(values) => {
        if (values[0]) onChange(values[0]);
      }}
      render={(props) => (
        <div {...props} aria-orientation={undefined} data-orientation={undefined} />
      )}
      aria-label={label ?? "Toggle Group"}
    >
      {/* The pill uses resolved geometry so its first paint matches the active item. */}
      <div
        aria-hidden
        data-toggle-pill=""
        // With no matching option there is nothing to indicate, and a pill with no
        // variant class would otherwise sit at the last measured position in the
        // default grey. `hidden` rather than unmounting so the element stays put
        // for the measuring effect to find.
        hidden={!activeOption}
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
          "variant-scope bg-(--accent-color)",
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
            <Toggle
              key={option.value}
              // The highlight pill measures the active item by this attribute
              // rather than through a collected ref — see the measuring effect.
              data-toggle-item={option.value}
              render={(props, state) => (
                <button
                  {...props}
                  type="button"
                  disabled={option.disabled}
                  aria-disabled={undefined}
                  data-disabled={option.disabled ? "" : undefined}
                  role="radio"
                  aria-pressed={undefined}
                  aria-checked={state.pressed}
                  data-state={state.pressed ? "on" : "off"}
                />
              )}
              data-composite-item-active={value === option.value ? "" : undefined}
              className={clsx(
                "variant-scope",
                size,
                option.color ? "custom-color" : option.variant,
                visuals === "icons" && "sized-inner-group-item",
                "sized-inner-group-item-height",
                "grid place-items-center transition-colors",
                (visuals === "icons" || visuals === "labels") && "grid-cols-1 grid-rows-1",
                visuals === "both" && "grid-cols-[auto_auto] grid-rows-1",
                // The active item sits on the pill, which is filled with this item's
                // own `--accent-color`; `--on-accent-color` is derived from that fill
                // so the label stays legible for every variant, both themes, and any
                // `option.color`. A theme-flipped `text-white dark:text-black` pair
                // cannot: the light-mode fill is only sometimes the darker of the two.
                value === option.value
                  ? "text-[var(--on-accent-color)]"
                  : "variant-responsive-text",
              )}
              style={
                option.color
                  ? ({
                      "--custom-color": option.color,
                    } as any)
                  : {}
              }
              value={option.value}
              // Native disabled buttons also exclude options from arrow navigation.
              disabled={false}
              aria-label={option.label}
            >
              {(visuals === "icons" || visuals === "both") && (
                <p className="sized-inner-group-item grid place-items-center">
                  {resolveIcon(option.icon)}
                </p>
              )}
              {(visuals === "labels" || visuals === "both") && (
                <p className={clsx("text-nowrap", visuals === "both" ? "pr-2" : "px-2")}>
                  {option.label}
                </p>
              )}
            </Toggle>
          </Tooltip>
        ))}
      </div>
    </BaseToggleGroup>
  );
}
