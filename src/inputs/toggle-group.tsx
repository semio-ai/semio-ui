import { useEffect, useRef, useState, type ReactNode } from "react";
import { ToggleGroup as RadixToggleGroup } from "radix-ui";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { Tooltip } from "../floating/tooltip";
import { Variant, Size } from "../types";
import { resolveIcon } from "../icons/registry";

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
      <motion.div
        style={
          activeOption?.color
            ? ({
                "--custom-color": activeOption.color,
              } as any)
            : undefined
        }
        className={clsx(
          activeOption?.color ? "custom-color" : activeOption?.variant,
          size,
          "absolute",
          "sized-inner-group-item rounded-xs",
          "responsive bg-(--accent-color)",
        )}
        initial={{
          x: 2,
        }}
        animate={{
          x: left,
          width,
          // backgroundColor:
          //   activeOption?.color ?? variantToVar(activeOption?.variant ?? Variant.Default),
        }}
        transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
      />
      <div className="z-1 inline-flex items-center justify-center p-0.5">
        {options.map((option, idx) => (
          <Tooltip
            key={option.value}
            disabled={option.disabled}
            content={option.label ?? "Option"}
            variant={option?.variant}
          >
            <RadixToggleGroup.Item
              key={option.value}
              ref={(el: HTMLButtonElement | null) => {
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
                <p className="sized-inner-group-item grid place-items-center">{resolveIcon(option.icon)}</p>
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
