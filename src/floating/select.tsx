import { CSSProperties, ReactNode } from "react";
import { IconPointFilled, IconSelector } from "@tabler/icons-react";
import { clsx } from "clsx";
// Will hopefully use later once we can search in the select.
// import { matchSorter } from "match-sorter";
import { Size, Variant } from "../types";
import { StaticIcon } from "../icons/static-icon";
import { NestedSelect } from "../nested-elements/select";
import { NestedRadio } from "../nested-elements/radio";
import { Chip } from "../chip";
import { NestedLabel } from "../nested-elements/label";
import { Dropdown } from "./dropdown";

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

/**
 * @param {Variant} variant - The variant of the select (defines colors)
 * @param {T} value - The value of the select
 * @param {function} onChange - The function to call when the value changes
 * @param {SelectOption[]} options - The options to display in the select
 * @param {Size} size - The size of the select
 * @param {string} label - The label of the select
 */
export interface SelectProps<T extends string | string[]> {
  value?: T;
  onChange: (value: T) => void;
  options: SelectOption[];
  size?: Size;
  label?: string;
  variant?: Variant;
  className?: string;
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
  label,
  variant,
  className,
}: SelectProps<T>) {
  const multiple = Array.isArray(value);

  const renderSingleOption = (selectOption?: SelectOption) => (
    <div
      style={
        {
          "--custom-color": selectOption?.color,
        } as CSSProperties
      }
      className={clsx(
        "responsive rounded-xs variant-mock-item-bg",
        "variant-responsive-text variant-responsive-appearing-outline",
        "flex flex-row flex-1 px-1 items-center",
        "sized-height",
        size,
        selectOption?.color ? "custom-color" : (selectOption?.variant ?? Variant.Default),
        className,
      )}
    >
      <div
        className={clsx("flex flex-1 flex-row items-center justify-center", "sized-height", size)}
      >
        <div
          className={clsx(
            size,
            selectOption?.color ? "custom-color" : (selectOption?.variant ?? Variant.Default),
            "responsive sized-mock-inner-item",
            "grid place-items-center",
            "variant-mock-inner-item",
          )}
        >
          {selectOption?.icon || <IconPointFilled className="w-3/5 h-3/5" />}
        </div>
        <span
          style={
            {
              "--custom-color": selectOption?.color,
            } as CSSProperties
          }
          className={clsx(
            size,
            "flex flex-1 flex-row px-3 items-center text-ellipsis text-nowrap",
            "responsive highlight-list-item",
            "sized-height",
            "sized-text",
            selectOption?.color ? "custom-color" : Variant.Default,
          )}
        >
          {selectOption?.label ?? label}
        </span>

        <StaticIcon
          size="fit"
          className="pr-0.5 items-center justify-around"
          variant={selectOption?.variant}
        >
          <IconSelector size="13px" />
        </StaticIcon>
      </div>
    </div>
  );

  return (
    <div className="flex flex-row w-full">
      <Dropdown
        trigger={renderSingleOption(options.find((o) => o.value === value))}
        variant={options.find((o) => o.value === value)?.variant ?? Variant.Default}
        color={options.find((o) => o.value === value)?.color ?? undefined}
      >
        {label && <NestedLabel>{label}</NestedLabel>}
        {multiple && options.length > 0 && (
          <NestedSelect
            variant={variant}
            values={value ?? []}
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
      {Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap w-full max-w-80 gap-1">
          {value.map((v) => {
            const option = options.find((o) => o.value === v);
            return (
              <Chip
                key={v}
                variant={variant}
                color={option?.color}
                size={smallerSize(size)}
                onDelete={(e) => {
                  console.log("delete", v);
                  onChange(value.filter((f) => f !== v) as T);
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
