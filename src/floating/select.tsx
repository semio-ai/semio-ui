import { CSSProperties, ReactNode } from "react";
import { IconLayoutGrid, IconPointFilled, IconSelector } from "@tabler/icons-react";
import { clsx } from "clsx";
// Will hopefully use later once we can search in the select.
// import { matchSorter } from "match-sorter";
import { Size, Variant } from "../types";
import { ICON_CLASS_NAME } from "../constants/icon";
import { StaticIcon } from "../icons/static-icon";
import { NestedSelect } from "../nested-elements/select";
import { NestedRadio } from "../nested-elements/radio";
import { Chip } from "../chip";
import { NestedLabel } from "../nested-elements/label";
import { Dropdown } from "./dropdown";
import { Tooltip } from "./tooltip";

/**
 * @param {string} label - The text to display in the option
 * @param {string} value - The unique key to register and identify the option
 * @param {boolean} disabled - Whether the option is disabled
 * @param {string} color - The color of the option
 * @param {ReactNode} icon - The icon to display in the option
 */
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  color?: string;
  variant?: Variant;
  icon?: ReactNode;
}

export type SelectVisuals = "icons" | "labels" | "both";
export type SelectSizing = "default" | "inner" | "list-item";

/**
 * @param {Variant} variant - The variant of the select (defines colors)
 * @param {T} value - The value of the select
 * @param {function} onChange - The function to call when the value changes
 * @param {SelectOption[]} options - The options to display in the select
 * @param {Size} size - The size of the select
 * @param {string} label - The label of the select
 * @param {SelectVisuals} visuals - How the trigger presents selected option data
 */
export interface SelectProps<T extends string | string[]> {
  value?: T;
  onChange: (value: T) => void;
  options: SelectOption[];
  size?: Size;
  sizing?: SelectSizing;
  label?: string;
  variant?: Variant;
  className?: string;
  showChips?: boolean;
  visuals?: SelectVisuals;
  side?: "left" | "right" | "top" | "bottom";
}

/**
 * A select component that allows users to choose from a list of options
 * @param {Variant} variant - The variant of the select (defines colors)
 * @param {T} value - The value of the select
 * @param {function} onChange - The function to call when the value changes
 * @param {SelectOption[]} options - The options to display in the select
 * @param {Size} size - The size of the select
 * @param {string} label - The label of the select
 */
export function Select<T extends string | string[]>({
  value,
  onChange,
  options,
  size = Size.Md,
  sizing = "default",
  label,
  variant,
  className,
  showChips = false,
  visuals = "both",
  side = "bottom",
}: SelectProps<T>) {
  const multiple = Array.isArray(value);
  const selectedValues: string[] = multiple ? (value as string[]) : [];
  const selectedOptions = multiple
    ? options.filter((option) => selectedValues.includes(option.value))
    : [];
  const triggerOption: SelectOption | undefined = multiple
    ? (() => {
        if (selectedOptions.length === 0) {
          return {
            value: "",
            label: label ?? "Select items",
            icon: <IconPointFilled className={ICON_CLASS_NAME} />,
            variant: variant ?? Variant.Default,
          };
        }
        if (selectedOptions.length === 1) {
          const [selectedOption] = selectedOptions;
          return {
            ...selectedOption,
            variant: selectedOption.variant ?? variant ?? Variant.Default,
          };
        }
        if (selectedOptions.length === options.length) {
          return {
            value: "",
            label: "All selected",
            icon: <IconLayoutGrid className={ICON_CLASS_NAME} />,
            variant: variant ?? Variant.Default,
          };
        }
        return {
          value: "",
          label: `${String(selectedOptions.length)} selected`,
          icon: <IconLayoutGrid className={ICON_CLASS_NAME} />,
          variant: variant ?? Variant.Default,
        };
      })()
    : options.find((o) => o.value === value);

  const triggerHeightClass = resolveHeightSizingClass(sizing);
  const triggerBoxClass = resolveBoxSizingClass(sizing);

  const renderSingleOption = (selectOption?: SelectOption) => {
    if (visuals === "icons") {
      const tooltipContent = selectOption?.label ?? label ?? "Select";
      return (
        <div
          style={
            {
              "--custom-color": selectOption?.color,
            } as CSSProperties
          }
          className={clsx(
            "responsive rounded-xs variant-mock-item-bg",
            "variant-responsive-text variant-responsive-appearing-outline",
            "flex items-center justify-center p-0",
            triggerBoxClass,
            size,
            selectOption?.color ? "custom-color" : (selectOption?.variant ?? Variant.Default),
            className,
          )}
        >
          <Tooltip content={tooltipContent}>
            <div className="icon-slot">
              {selectOption?.icon || <IconPointFilled className={ICON_CLASS_NAME} />}
            </div>
          </Tooltip>
        </div>
      );
    }

    const showIcon = visuals === "both";

    return (
      <div
        style={
          {
            "--custom-color": selectOption?.color,
          } as CSSProperties
        }
        className={clsx(
          "responsive rounded-xs variant-mock-item-bg",
          "variant-responsive-text variant-responsive-appearing-outline",
          "flex flex-row flex-1 pl-1 pr-0 items-center min-w-0",
          triggerHeightClass,
          size,
          selectOption?.color ? "custom-color" : (selectOption?.variant ?? Variant.Default),
          className,
        )}
      >
        <div
          className={clsx(
            "flex flex-1 flex-row items-center justify-center min-w-0",
            triggerHeightClass,
            size,
          )}
        >
          {showIcon && (
            <div
              className={clsx(
                size,
                selectOption?.color ? "custom-color" : (selectOption?.variant ?? Variant.Default),
                "responsive sized-mock-inner-item",
                "grid place-items-center",
                "variant-mock-inner-item",
              )}
            >
              <span className="icon-slot">
                {selectOption?.icon || <IconPointFilled className={ICON_CLASS_NAME} />}
              </span>
            </div>
          )}
          <span
            style={
              {
                "--custom-color": selectOption?.color,
              } as CSSProperties
            }
            className={clsx(
              size,
              "flex-1 flex items-center min-w-0",
              "responsive highlight-list-item",
              triggerHeightClass,
              "sized-text",
              showIcon ? "pl-3 pr-0" : "pl-2 pr-0",
              selectOption?.color ? "custom-color" : Variant.Default,
            )}
          >
            <span className="truncate">{selectOption?.label ?? label}</span>
          </span>

          <StaticIcon
            size={size}
            className="sized-text sized-width"
            variant={selectOption?.variant}
          >
            <IconSelector className={ICON_CLASS_NAME} />
          </StaticIcon>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx("flex flex-col gap-2", visuals === "icons" ? "w-fit" : "w-full")}>
      <div className={clsx("flex flex-row", visuals === "icons" ? "w-fit" : "w-full")}>
        <Dropdown
          side={side}
          trigger={renderSingleOption(triggerOption)}
          variant={triggerOption?.variant ?? variant ?? Variant.Default}
          color={triggerOption?.color ?? undefined}
        >
          {label && <NestedLabel>{label}</NestedLabel>}
          {multiple && options.length > 0 && (
            <NestedSelect
              variant={variant}
              values={selectedValues}
              onChange={(v: string[]) => {
                onChange(v as T);
              }}
              options={options}
            />
          )}
          {!multiple && options.length > 0 && (
            <NestedRadio
              variant={variant}
              value={value}
              onChange={(v: string) => {
                onChange(v as T);
              }}
              options={options}
            />
          )}
          {options.length === 0 && (
            <div className={clsx("p-2 text-center text-neutral-500", "sized-text", size)}>
              No results found
            </div>
          )}
        </Dropdown>
      </div>
      {multiple && showChips && selectedValues.length > 0 && (
        <div className="flex flex-wrap w-full gap-1">
          {selectedValues.map((v) => {
            const option = options.find((o) => o.value === v);
            return (
              <Chip
                key={v}
                variant={variant}
                color={option?.color}
                size={smallerSize(size)}
                onDelete={(e) => {
                  onChange(selectedValues.filter((f) => f !== v) as T);
                  e.stopPropagation();
                }}
              >
                {option?.label || "Unknown"}
              </Chip>
            );
          })}
        </div>
      )}
    </div>
  );
}

function smallerSize(size: Size): Size {
  if (size === Size.Xs) return Size.Xs;
  if (size === Size.Sm) return Size.Xs;
  if (size === Size.Md) return Size.Sm;
  if (size === Size.Lg) return Size.Md;
  return Size.Sm;
}

function resolveBoxSizingClass(sizing: SelectSizing): string {
  if (sizing === "inner") return "sized-inner-group-item";
  if (sizing === "list-item") return "sized-list-item-indicator";
  return "sized-height sized-width";
}

function resolveHeightSizingClass(sizing: SelectSizing): string {
  if (sizing === "inner") return "sized-inner-group-item-height";
  if (sizing === "list-item") return "sized-list-item-indicator-height";
  return "sized-height";
}
