import { useEffect, useRef, useState, type ReactNode } from "react";
import { ToggleGroup as RadixToggleGroup } from "radix-ui";
import { altColor } from "@semio/utils";
import { motion } from "motion/react";
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

  const tabsRef = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    function setTabPosition() {
      const currentTab = tabsRef.current[itemIndex];
      setLeft(currentTab?.offsetLeft ?? 0);
      setWidth(currentTab?.clientWidth ?? 0);
    }

    setTabPosition();
    window.addEventListener("resize", setTabPosition);

    return () => window.removeEventListener("resize", setTabPosition);
  }, [itemIndex]);

  return (
    <RadixToggleGroup.Root
      className={clsx(
        "transition-all relative inline-flex items-center overflow-hidden rounded-sm ",
        bg && "dark:bg-layout-dark-inset bg-layout-light-inset",
        className,
      )}
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v);
      }}
      aria-label={label ?? "Toggle Group"}
    >
      <motion.div
        className={clsx("absolute", "rounded-xs sized-inner-group-item", size)}
        animate={{
          x: left,
          width,
          backgroundColor:
            activeOption?.color ?? variantToVar(activeOption?.variant ?? Variant.Default),
        }}
        transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
      />
      <div className="inline-flex items-center justify-center z-1 p-0.5">
        {options.map((option, idx) => (
          <Tooltip
            key={option.value}
            disabled={option.disabled}
            content={option.label ?? "Option"}
            variant={option?.variant}
          >
            <RadixToggleGroup.Item
              key={option.value}
              ref={(el) => {
                if (el) tabsRef.current[idx] = el;
              }}
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
                value === option.value ? "dark:text-black text-white" : "variant-responsive-text",
              )}
              style={
                option.color
                  ? ({
                      "--custom-color": option.color,
                      "--darker-custom-color": altColor(option.color, -0.1),
                      "--lighter-custom-color": altColor(option.color, 0.2),
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

function variantToVar(variant: Variant): string {
  switch (variant) {
    case Variant.Primary:
      return "var(--color-primary-500)";
    case Variant.Secondary:
      return "var(--color-secondary-500)";
    case Variant.Tertiary:
      return "var(--color-tertiary-500)";
    case Variant.Error:
      return "var(--color-error-500)";
    case Variant.Warning:
      return "var(--color-warning-500)";
    case Variant.Info:
      return "var(--color-info-500)";
    case Variant.Success:
      return "var(--color-success-500)";
    default:
      return "var(--color-default-500)";
  }
}
