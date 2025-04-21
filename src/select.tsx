import { CSSProperties, ReactNode } from "react";
import { IconPointFilled, IconSelector } from "@tabler/icons-react";
import { clsx } from "clsx";
// import { matchSorter } from "match-sorter";
import { Size, Variant } from "./types";
import { getOutline } from "./style-functions";
import { Dropdown } from "./dropdown";
import { StaticIcon } from "./icons/static-icon";
import { NestedSelect } from "./nested-elements/select";
import { NestedRadio } from "./nested-elements/radio";
import { Chip } from "./chip";
import { NestedLabel } from "./nested-elements/label";

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
  variant?: Variant;
  value?: T;
  onChange: (value: T) => void;
  options: {
    label: string;
    value: string;
    disabled?: boolean;
    color?: string;
    icon?: ReactNode;
  }[];
  size?: Size;
  label?: string;
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
  variant,
  size = Size.Md,
  label,
}: SelectProps<T>) {
  const multiple = Array.isArray(value);
  return (
    <div className="flex flex-row w-full">
      <Dropdown
        trigger={
          <div
            className={clsx(
              "rounded-[1px]",
              "w-full flex flex-row flex-1 items-center",
              "focus:outline focus:outline-offset-2",
              "data-[state=open]:outline data-[state=open]:outline-offset-2",
              "px-1",
              size,
              "sized-height",
              getOutline(variant),
            )}
          >
            {/* {typeof value === "string" && value ? ( */}
            <div
              className={clsx("flex flex-1 flex-row items-center justify-center", "sized-height")}
            >
              <StaticIcon
                size="fit"
                className="w-3 h-3 pl-0"
                color={options.find((o) => o.value === value)?.color}
              >
                {options.find((o) => o.value === value)?.icon || <IconPointFilled size="13px" />}
              </StaticIcon>
              <span
                style={
                  {
                    "--text-color": options.find((o) => o.value === value)?.color,
                  } as CSSProperties
                }
                className={clsx(
                  "flex flex-1 flex-row px-3 items-center text-ellipsis text-nowrap",
                  "highlight-list-item",
                  "sized-height",
                  "sized-text",
                  options.find((o) => o.value === value)?.color ? "custom-color" : Variant.Default,
                )}
              >
                {value ? options.find((o) => o.value === value)?.label : label}
              </span>

              <StaticIcon
                size="fit"
                className="pr-0.5 items-center justify-around"
                variant={variant}
              >
                <IconSelector size="13px" />
              </StaticIcon>
            </div>
          </div>
        }
        variant={variant}
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
