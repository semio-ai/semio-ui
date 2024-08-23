import { CSSProperties, ReactNode } from "react";
import { IconPointFilled, IconSelector } from "@tabler/icons-react";
import { clsx } from "clsx";
// import { matchSorter } from "match-sorter";
import { Size, Variant } from "./types";
import {
  getOutline,
  getHeight,
  getBasicTextColor,
  getFontSize,
} from "./style-functions";
import { Dropdown } from "./dropdown";
import { StaticIcon } from "./icons/static-icon";
import { NestedSelect } from "./nested-elements/select";
import { NestedRadio } from "./nested-elements/radio";
import { Chip } from "./chip";

export interface SelectProps<T extends string | string[]> {
  variant?: Variant;
  value: T;
  onChange: (value: T) => void;
  options: {
    label: string;
    value: string;
    disabled?: boolean;
    color?: string;
    icon?: ReactNode;
  }[];
  size?: Size;
}

export function Select<T extends string | string[]>({
  value,
  onChange,
  options,
  variant,
  size = Size.Md,
}: SelectProps<T>) {
  const multiple = Array.isArray(value);
  // const [searchValue, setSearchValue] = useState("");
  // const matches = useMemo(
  //   () => matchSorter(options, searchValue, { keys: ["label"] }),
  //   [searchValue, options],
  // );
  return (
    <div className="flex flex-row">

      <Dropdown
        trigger={
          <div
            className={clsx(
              // "dark:bg-neutral-950/20 bg-neutral-50/20",
              "relative flex flex-row items-center w-full",
              "focus:outline focus:outline-1 focus:outline-offset-2",
              "data-[state=open]:outline data-[state=open]:outline-1 data-[state=open]:outline-offset-2",
              "px-1",
              getOutline(variant),
              getHeight(size),
              "w-full",
            )}
          >
            {(typeof value === "string" && value) ? (
              <div className="flex flex-1 flex-row items-center">
                <StaticIcon
                  size="fit"
                  className="w-3 h-3 pl-0"
                  color={options.find((o) => o.value === value)?.color}
                >
                  {options.find((o) => o.value === value)?.icon || (
                    <IconPointFilled size="13px" />
                  )}
                </StaticIcon>
                <span
                  style={
                    {
                      "--text-color": options.find((o) => o.value === value)
                        ?.color,
                    } as CSSProperties
                  }
                  className={clsx(
                    "flex-1 py-2 px-3",
                    getFontSize(size),
                    getBasicTextColor(
                      options.find((o) => o.value === value)?.color
                        ? "custom"
                        : Variant.Default,
                    ),
                  )}
                >
                  {options.find((o) => o.value === value)?.label}
                </span>

                <StaticIcon
                  size="fit"
                  className="pr-0.5 items-center justify-around"
                  variant={variant}
                >
                  <IconSelector size="13px" />
                </StaticIcon>
              </div>
              // <Chip
              //   variant={variant}
              //   color={options.find((o) => o.value === value)?.color}
              //   value={options.find((o) => o.value === value)?.label || "Unknown"}
              //   icon={options.find((o) => o.value === value)?.icon}
              //   size={smallerSize(size)}
              // />
            ) :
            (
              <div className="items-center w-full m-1 shadow">
                <IconSelector size="24px" />
              </div>
            )
          }
          </div>
        }
        variant={variant}
      >
        {multiple && options.length > 0 && (
          <NestedSelect
            variant={variant}
            values={value}
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
          <div
            className={clsx(
              "p-2 text-center text-neutral-500",
              getFontSize(size),
            )}
          >
            No results found
          </div>
        )}
      </Dropdown>
      {Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap w-full max-w-80 gap-1">
            {value.map((v) => (
              <Chip
                key={v}
                variant={variant}
                color={options.find((o) => o.value === v)?.color}
                value={options.find((o) => o.value === v)?.label || "Unknown"}
                size={smallerSize(size)}
                icon={options.find((o) => o.value === v)?.icon}
                onDelete={(e) => {
                  console.log("delete", v);
                  onChange(value.filter((f) => f !== v) as T);
                  e.stopPropagation();
                }}
              />
            ))}
        </div>
      )}
    </div>
    // <Listbox value={value} onChange={onChange}>
    //   <ListboxButton
    //     className={clsx(
    //       "transition-colors",
    //       "dark:text-white text-black",
    //       "min-w-40",
    //       getHoverButtonStyles(variant),
    //       "pt-2 pb-2 pr-4 pl-4 flex items-center justify-between gap-2",
    //     )}
    //   >
    //     {options.find((f) => f.value === value)?.label || "Select"}
    //     <IconChevronDown
    //       className={clsx(
    //         "transition-transform w-5 h-5",

    //         // open ? "rotate-0" : "rotate-180",
    //       )}
    //     />
    //   </ListboxButton>
    //   <ListboxOptions
    //     anchor="bottom"
    //     transition
    //     className={clsx(
    //       "w-[var(--button-width)] border border-white/5 dark:bg-neutral-800/50 bg-neutral-200/50 backdrop-blur-md p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
    //       "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
    //     )}
    //   >
    //     {options.map((f) => (
    //       <ListboxOption
    //         key={f.value}
    //         value={f.value}
    //         className="group flex cursor-default items-center gap-2 py-1.5 px-3 select-none data-[focus]:bg-white/10"
    //       >
    //         <IconCheck className="invisible size-4 group-data-[selected]:visible" />
    //         <div className="text-sm/6 text-white">{f.label}</div>
    //       </ListboxOption>
    //     ))}
    //   </ListboxOptions>
    // </Listbox>
  );
}

function smallerSize(size: Size): Size {
  if (size === Size.Xs) return Size.Xs;
  if (size === Size.Sm) return Size.Xs;
  if (size === Size.Md) return Size.Sm;
  if (size === Size.Lg) return Size.Md;
  return Size.Sm;
}
