import { CSSProperties, useCallback, useMemo } from "react";
import { IconPointFilled, IconSelector, IconWorld, IconLayoutGrid } from "@tabler/icons-react";
import { clsx } from "clsx";
import { Size, Variant } from "../types";
import { ICON_CLASS_NAME } from "../constants/icon";
import { StaticIcon } from "../icons/static-icon";
import { NestedCheckboxTree, TreeOption } from "../nested-elements/checkbox-tree";
import { NestedLabel } from "../nested-elements/label";
import { NestedParentProvider } from "../nested-elements/context";
import { NestedParent } from "../nested-elements/types";
import { Chip } from "../chip";
import { Dropdown } from "./dropdown";

/**
 * Props for the SelectTree component
 * @param {TreeOption[]} options - The tree options to display in the select
 * @param {string[]} value - The selected values
 * @param {function} onChange - The function to call when the value changes
 * @param {Size} size - The size of the select
 * @param {string} label - The label of the select
 * @param {Variant} variant - The variant of the select (defines colors)
 * @param {string} className - Additional CSS classes
 * @param {boolean} showChips - Whether to show chips for selected items
 */
export interface SelectTreeProps {
  options: TreeOption[];
  value: string[];
  onChange: (value: string[], changes: { id: string; operation: "add" | "remove" }[]) => void;
  size?: Size;
  label?: string;
  variant?: Variant;
  className?: string;
  showChips?: boolean;
}

/**
 * A tree select component that allows hierarchical multi-selection
 */
export function SelectTree({
  value,
  onChange,
  options,
  size = Size.Md,
  label,
  variant,
  className,
  showChips = false,
}: SelectTreeProps) {
  // Get all possible leaf values from the tree
  const getAllLeafValues = useCallback((option: TreeOption): string[] => {
    if (!option.children || option.children.length === 0) {
      return [option.value];
    }

    const leafValues: string[] = [];
    option.children.forEach((child) => {
      leafValues.push(...getAllLeafValues(child));
    });
    return leafValues;
  }, []);

  // Get all possible values (including groups)
  const getAllValues = useCallback((option: TreeOption): string[] => {
    const values: string[] = [option.value];
    if (option.children) {
      option.children.forEach((child) => {
        values.push(...getAllValues(child));
      });
    }
    return values;
  }, []);

  // Find an option by value in the tree
  const findOption = useCallback(
    (searchValue: string, searchOptions: TreeOption[] = options): TreeOption | undefined => {
      for (const option of searchOptions) {
        if (option.value === searchValue) {
          return option;
        }
        if (option.children) {
          const found = findOption(searchValue, option.children);
          if (found) return found;
        }
      }
      return undefined;
    },
    [options],
  );

  // Helper function to find complete groups/subgroups recursively
  const findCompleteGroups = useCallback(
    (searchOptions: TreeOption[], selectedValues: string[]): TreeOption[] => {
      const completeGroups: TreeOption[] = [];

      for (const option of searchOptions) {
        if (option.children && option.children.length > 0) {
          const groupLeafValues = getAllLeafValues(option);
          const allInGroup = groupLeafValues.every((v) => selectedValues.includes(v));
          const someInGroup = groupLeafValues.some((v) => selectedValues.includes(v));

          if (allInGroup) {
            completeGroups.push(option);
          } else if (someInGroup) {
            // Check subgroups recursively
            const subCompleteGroups = findCompleteGroups(option.children, selectedValues);
            completeGroups.push(...subCompleteGroups);
          }
        }
      }

      return completeGroups;
    },
    [getAllLeafValues],
  );

  // Determine what to show in the trigger
  const triggerDisplay = useMemo(() => {
    // Get all possible leaf values from all options
    const allLeafValues: string[] = [];
    options.forEach((option) => {
      allLeafValues.push(...getAllLeafValues(option));
    });

    // Only count actual leaf values in the selection, not group IDs
    const leafValueSet = new Set(allLeafValues);
    const selectedLeafValues = value.filter((v) => leafValueSet.has(v));
    const selectedCount = selectedLeafValues.length;
    const totalCount = allLeafValues.length;

    // If nothing is selected
    if (selectedCount === 0) {
      return {
        icon: <IconPointFilled className={ICON_CLASS_NAME} />,
        label: label || "Select items",
        color: undefined,
        variant: Variant.Default,
      };
    }

    // If everything is selected
    if (selectedCount === totalCount) {
      return {
        icon: <IconWorld className={ICON_CLASS_NAME} />,
        label: "All selected",
        color: undefined,
        variant: variant || Variant.Default,
      };
    }

    // If only one item is selected
    if (selectedCount === 1) {
      const selectedOption = findOption(value[0]);
      if (selectedOption) {
        return {
          icon: selectedOption.icon || <IconPointFilled className={ICON_CLASS_NAME} />,
          label: selectedOption.label,
          color: selectedOption.color,
          variant: selectedOption.variant || variant || Variant.Default,
        };
      }
    }

    // Find all complete groups (including nested ones)
    const completeGroups = findCompleteGroups(options, selectedLeafValues);

    // If we have exactly one complete group that matches all selections
    if (completeGroups.length === 1) {
      const group = completeGroups[0];
      const groupLeafCount = getAllLeafValues(group).length;
      if (groupLeafCount === selectedCount) {
        return {
          icon: group.icon || <IconLayoutGrid className={ICON_CLASS_NAME} />,
          label: group.label,
          color: group.color,
          variant: group.variant || variant || Variant.Default,
        };
      }
    }

    // Check if all selected items are within a single partial group
    for (const option of options) {
      if (option.children) {
        const groupLeafValues = getAllLeafValues(option);
        const selectedInGroup = groupLeafValues.filter((v) => selectedLeafValues.includes(v));

        // If all selections are within this group (but not all group items are selected)
        if (
          selectedInGroup.length === selectedCount &&
          selectedInGroup.length < groupLeafValues.length
        ) {
          // Check if there's a complete subgroup
          const subCompleteGroups = findCompleteGroups(option.children, selectedLeafValues);
          if (subCompleteGroups.length === 1) {
            const subGroup = subCompleteGroups[0];
            const subGroupLeafCount = getAllLeafValues(subGroup).length;
            if (subGroupLeafCount === selectedCount) {
              // Show the complete subgroup
              return {
                icon: subGroup.icon || <IconLayoutGrid className={ICON_CLASS_NAME} />,
                label: subGroup.label,
                color: subGroup.color,
                variant: subGroup.variant || variant || Variant.Default,
              };
            }
          }

          // Show partial selection within the group
          return {
            icon: option.icon || <IconLayoutGrid className={ICON_CLASS_NAME} />,
            label: `${option.label} (${String(selectedInGroup.length)} of ${String(groupLeafValues.length)} selected)`,
            color: option.color,
            variant: option.variant || variant || Variant.Default,
          };
        }
      }
    }

    // Multiple complete groups or mixed selection
    if (completeGroups.length > 1) {
      // Show the names of complete groups if there are just a few
      if (completeGroups.length <= 3) {
        const groupNames = completeGroups.map((g) => g.label).join(", ");
        return {
          icon: <IconLayoutGrid className={ICON_CLASS_NAME} />,
          label: groupNames,
          color: undefined,
          variant: variant || Variant.Default,
        };
      }
    }

    // Generic partial selection
    return {
      icon: <IconLayoutGrid className={ICON_CLASS_NAME} />,
      label: `${String(selectedCount)} of ${String(totalCount)} selected`,
      color: undefined,
      variant: variant || Variant.Default,
    };
  }, [value, options, label, variant, getAllLeafValues, findOption, findCompleteGroups]);

  // Render the trigger element
  const renderTrigger = () => (
    <div
      style={
        {
          "--custom-color": triggerDisplay.color,
        } as CSSProperties
      }
      className={clsx(
        "responsive variant-mock-item-bg rounded-xs",
        "variant-responsive-text variant-responsive-appearing-outline",
        "flex min-w-0 flex-1 flex-row items-center pr-0 pl-1",
        "sized-height",
        size,
        triggerDisplay.color ? "custom-color" : triggerDisplay.variant,
        className,
      )}
    >
      <div
        className={clsx(
          "flex min-w-0 flex-1 flex-row items-center justify-center",
          "sized-height",
          size,
        )}
      >
        <div
          className={clsx(
            size,
            triggerDisplay.color ? "custom-color" : triggerDisplay.variant,
            "responsive sized-mock-inner-item",
            "grid shrink-0 place-items-center",
            "variant-mock-inner-item",
          )}
        >
          <span className="icon-slot">{triggerDisplay.icon}</span>
        </div>
        <span
          style={
            {
              "--custom-color": triggerDisplay.color,
            } as CSSProperties
          }
          className={clsx(
            size,
            "flex min-w-0 flex-1 items-center pr-0 pl-3",
            "responsive highlight-list-item",
            "sized-height",
            "sized-text",
            triggerDisplay.color ? "custom-color" : Variant.Default,
          )}
        >
          <span className="truncate">{triggerDisplay.label}</span>
        </span>

        <StaticIcon
          size={size}
          className="sized-text sized-width shrink-0"
          variant={triggerDisplay.variant}
        >
          <IconSelector className={ICON_CLASS_NAME} />
        </StaticIcon>
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full min-w-0 flex-row">
        <Dropdown
          trigger={renderTrigger()}
          variant={triggerDisplay.variant}
          color={triggerDisplay.color}
        >
          {label && <NestedLabel>{label}</NestedLabel>}
          <NestedParentProvider value={NestedParent.Dropdown}>
            <NestedCheckboxTree
              variant={variant}
              values={value}
              onChange={(newValues, changes) => onChange(newValues, changes)}
              options={options}
            />
          </NestedParentProvider>
        </Dropdown>
      </div>
      {showChips && value.length > 0 && (
        <div className="flex w-full flex-wrap gap-1">
          {value.map((v) => {
            const option = findOption(v);
            if (!option) return null;
            // Only show chips for leaf nodes
            const isLeaf = !option.children || option.children.length === 0;
            if (!isLeaf) return null;
            return (
              <Chip
                key={v}
                variant={variant}
                color={option.color}
                size={smallerSize(size)}
                onDelete={(e) => {
                  onChange(
                    value.filter((f) => f !== v),
                    [{ id: v, operation: "remove" }],
                  );
                  e.stopPropagation();
                }}
              >
                {option.label}
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
