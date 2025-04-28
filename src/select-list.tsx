import { ReactNode, useMemo } from "react";
import { IconPointFilled } from "@tabler/icons-react";
import { clsx } from "clsx";
// import { matchSorter } from "match-sorter";
import { Size, Variant } from "./types";
import { TableList } from "./layouts/table-list";
import { SelectProps } from "./floating/select";

export function SelectList<T extends string | string[]>({
  value,
  onChange,
  options,
  variant = Variant.Default,
  size = Size.Md,
  notFound,
}: SelectProps<T> & { notFound?: ReactNode }) {
  const multiple = Array.isArray(value);
  const handleToggle = (v: string) => {
    if (multiple) {
      if (value?.includes(v)) {
        onChange(value.filter((f) => f !== v) as T);
      } else {
        onChange([...(value as string[]), v] as T);
      }
    } else {
      onChange(v as T);
    }
  };

  const selection: T[] = useMemo(() => {
    if (Array.isArray(value)) {
      return value;
    } else if (value) {
      return [value];
    } else {
      return [];
    }
  }, [value]);

  const [rowClassName, iconClassName] = getFocusAndSelectStyles(variant);
  return (
    <TableList
      noHeader
      notFound={notFound}
      selection={selection as string[]}
      rowClassName={clsx(
        size,
        "dark:bg-transparent bg-transparent hover:bg-neutral-500/10",
        "focus:outline outline-[1.5px] outline-offset-[-2px]",
        "has-focus:outline flex flex-row items-center",
        "aria-selected:focus:outline-black/50 aria-selected:has-focus:outline-black/50",
        "sized-height",
        rowClassName,
      )}
      data={options.map((option) => ({ id: option.value, ...option }))}
      columns={[
        {
          key: "item",
          header: "item",
          align: "left",
          flex: true,
          render: (item) => (
            <div className="flex flex-row items-center px-2 gap-3 cursor-pointer">
              <div
                className={clsx(
                  "p-1 flex flex-row items-center justify-center",
                  "dark:group-aria-selected/row:bg-neutral-950 group-aria-selected/row:bg-neutral-50 rounded-full bg-transparent text-neutral-500",
                  iconClassName,
                )}
              >
                {item.icon ?? <IconPointFilled />}
              </div>
              <div
                className={clsx(
                  size,
                  "dark:group-aria-selected/row:text-neutral-950 group-aria-selected/row:text-neutral-50 text-neutral-500",
                  "select-none cursor-pointer",
                  "sized-text",
                )}
              >
                {item.label}
              </div>
            </div>
          ),
        },
      ]}
      onRowEnter={handleToggle}
      onRowClick={handleToggle}
    />
  );
}

const getFocusAndSelectStyles = (variant: Variant): [string, string] => {
  switch (variant) {
    case Variant.Primary:
      return [
        "outline-primary-500/50 aria-selected:bg-primary-500/50",
        "group-aria-selected/row:text-primary-500/75",
      ];
    case Variant.Secondary:
      return [
        "outline-secondary-500/50 aria-selected:bg-secondary-500/50",
        "group-aria-selected/row:text-secondary-500/75",
      ];
    case Variant.Tertiary:
      return [
        "outline-tertiary-500/50 aria-selected:bg-tertiary-500/50",
        "group-aria-selected/row:text-tertiary-500/75",
      ];
    case Variant.Success:
      return [
        "outline-success-500/50 aria-selected:bg-success-500/50",
        "group-aria-selected/row:text-success-500/75",
      ];
    case Variant.Warning:
      return [
        "outline-warning-500/50 aria-selected:bg-warning-500/50",
        "group-aria-selected/row:text-warning-500/75",
      ];
    case Variant.Error:
      return [
        "outline-error-500/50 aria-selected:bg-error-500/50",
        "group-aria-selected/row:text-error-500/75",
      ];
    case Variant.Info:
      return [
        "outline-info-500/50 aria-selected:bg-info-500/50",
        "group-aria-selected/row:text-info-500/75",
      ];
    case Variant.Default:
    default:
      return [
        "outline-neutral-500/50 aria-selected:bg-neutral-500/50",
        "group-aria-selected/row:text-neutral-500/75",
      ];
  }
};
