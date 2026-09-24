import { DropdownMenu, ContextMenu } from "radix-ui";
import { type MouseEvent, type CSSProperties, useCallback } from "react";
import { clsx } from "clsx";
import { Icon, resolveIcon, type IconValue } from "../icons/registry";
import { Variant } from "../types";
import { NestedParent } from "./types";
import { useNestedParent } from "./context";

/**
 * An Option case for tree-like data
 * @property value - The unique value of the option
 * @property label - The display label of the option
 * @property children - Optional nested children options
 * @property disabled - Whether the option is disabled (disregarded if the option has children);
 * @property variant - The variant style of the option (disregarded if the option has children);
 * @property color - The color style of the option (disregarded if the option has children);
 * @property icon - Optional custom icon to display instead of the default checkbox/indicator
 */
export interface TreeOption {
  value: string;
  label: string;
  children?: TreeOption[];
  disabled?: boolean;
  variant?: Variant;
  color?: string;
  icon?: IconValue;
}

export interface NestedCheckboxTreeProps {
  variant?: Variant;
  disabled?: boolean;
  onChange?: (values: string[], changes: { id: string; operation: "add" | "remove" }[]) => void;
  values: string[];
  options: TreeOption[];
}

enum CheckboxState {
  Checked = "checked",
  Unchecked = "unchecked",
  Indeterminate = "indeterminate",
}

/**
 * A component that renders a nested checkbox tree with hierarchical selection.
 * Groups automatically infer their state from their children.
 */
export function NestedCheckboxTree({
  variant,
  disabled,
  onChange,
  values,
  options,
}: NestedCheckboxTreeProps) {
  const parent = useNestedParent();

  const ItemComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.CheckboxItem : ContextMenu.CheckboxItem;

  const SubComponent = parent === NestedParent.Dropdown ? DropdownMenu.Sub : ContextMenu.Sub;

  const SubTriggerComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.SubTrigger : ContextMenu.SubTrigger;

  const PortalComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.Portal : ContextMenu.Portal;

  const SubContentComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.SubContent : ContextMenu.SubContent;

  const ItemIndicatorComponent =
    parent === NestedParent.Dropdown ? DropdownMenu.ItemIndicator : ContextMenu.ItemIndicator;

  const GroupComponent = parent === NestedParent.Dropdown ? DropdownMenu.Group : ContextMenu.Group;

  // Get all descendant leaf values from a tree node (excluding group IDs)
  const getAllDescendantValues = useCallback((option: TreeOption): string[] => {
    if (!option.children || option.children.length === 0) {
      return [option.value];
    }

    const descendantValues: string[] = [];
    option.children.forEach((child) => {
      descendantValues.push(...getAllDescendantValues(child));
    });
    return descendantValues;
  }, []);

  // Get checkbox state for a tree node
  const getCheckboxState = useCallback(
    (option: TreeOption): CheckboxState => {
      const hasChildren = option.children && option.children.length > 0;

      if (hasChildren && option.children) {
        // For groups, only check children's state
        const childValues: string[] = [];
        option.children.forEach((child) => {
          childValues.push(...getAllDescendantValues(child));
        });

        const checkedCount = childValues.filter((v) => values.includes(v)).length;
        if (checkedCount === 0) return CheckboxState.Unchecked;
        if (checkedCount === childValues.length) return CheckboxState.Checked;
        return CheckboxState.Indeterminate;
      } else {
        // For leaf nodes, check if the value is selected
        return values.includes(option.value) ? CheckboxState.Checked : CheckboxState.Unchecked;
      }
    },
    [values, getAllDescendantValues],
  );

  // Handle checkbox change for a tree node
  const handleCheckboxChange = useCallback(
    (option: TreeOption) => {
      if (!onChange) return;

      const descendantValues = getAllDescendantValues(option);
      const currentState = getCheckboxState(option);

      // Determine the new checked state based on current state
      let shouldCheck = false;
      if (currentState === CheckboxState.Indeterminate) {
        // If indeterminate, check all
        shouldCheck = true;
      } else if (currentState === CheckboxState.Checked) {
        // If checked, uncheck all
        shouldCheck = false;
      } else {
        // If unchecked, check all
        shouldCheck = true;
      }

      if (shouldCheck) {
        // Add all descendant values
        const newValues = new Set(values);
        const changes: { id: string; operation: "add" | "remove" }[] = [];
        descendantValues.forEach((v) => {
          if (!values.includes(v)) {
            newValues.add(v);
            changes.push({ id: v, operation: "add" });
          }
        });
        onChange(Array.from(newValues), changes);
      } else {
        // Remove all descendant values
        const newValues = values.filter((v) => !descendantValues.includes(v));
        const changes: { id: string; operation: "add" | "remove" }[] = [];
        descendantValues.forEach((v) => {
          if (values.includes(v)) {
            changes.push({ id: v, operation: "remove" });
          }
        });
        onChange(newValues, changes);
      }
    },
    [values, onChange, getAllDescendantValues, getCheckboxState],
  );

  // Render a tree node
  const renderTreeNode = (option: TreeOption) => {
    const state = getCheckboxState(option);
    const hasChildren = option.children && option.children.length > 0;

    if (hasChildren) {
      // Render as submenu with children
      return (
        <SubComponent key={option.value}>
          <SubTriggerComponent
            disabled={option.disabled || disabled}
            className={clsx(
              "group/item",
              "flex items-center rounded-xs leading-none",
              "relative min-h-7 min-w-0 px-1.25 py-1 pl-7.5 text-sm outline-hidden select-none",
              "data-disabled:pointer-events-none",
              "variant-scope highlight-list-item",
              option.color ? "custom-color" : (option.variant ?? variant),
            )}
            style={
              option.color
                ? ({
                    "--custom-color": option.color,
                  } as CSSProperties)
                : {}
            }
            data-state={(() => {
              if (state === CheckboxState.Checked) return "checked";
              if (state === CheckboxState.Indeterminate) return "indeterminate";
              return "unchecked";
            })()}
          >
            <div
              role="checkbox"
              aria-checked={(() => {
                if (state === CheckboxState.Checked) return "true";
                if (state === CheckboxState.Indeterminate) return "mixed";
                return "false";
              })()}
              tabIndex={0}
              className={clsx(
                "absolute top-1/2 left-1 grid -translate-y-1/2 cursor-pointer place-items-center",
                "variant-scope check-indicator",
                option.color ? "custom-color" : (option.variant ?? variant),
              )}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCheckboxChange(option);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  e.preventDefault();
                  handleCheckboxChange(option);
                }
              }}
            >
              <span className="icon-slot">
                {resolveIcon(option.icon) ||
                  (() => {
                    if (state === CheckboxState.Checked) {
                      return <Icon name="check" />;
                    }
                    if (state === CheckboxState.Indeterminate) {
                      return <Icon name="minus" />;
                    }
                    return <Icon name="point" />;
                  })()}
              </span>
            </div>
            <span className="block min-w-0 truncate">{option.label}</span>
            <div
              className={clsx(
                "ml-auto inline-flex shrink-0 items-center justify-center pl-5",
                "variant-scope text-variant",
                option.variant ?? variant,
              )}
            >
              <Icon name="submenu" className="shrink-0" />
            </div>
          </SubTriggerComponent>
          <PortalComponent>
            <SubContentComponent
              className={clsx(
                "variant-scope card-overlay dropdown-content",
                "min-w-55 p-0.5",
                option.variant ?? variant,
              )}
            >
              <GroupComponent>
                {option.children?.map((child) => renderTreeNode(child))}
              </GroupComponent>
            </SubContentComponent>
          </PortalComponent>
        </SubComponent>
      );
    } else {
      // Render as leaf checkbox item
      return (
        <ItemComponent
          key={option.value}
          color={option.color}
          checked={state === CheckboxState.Checked}
          onCheckedChange={() => handleCheckboxChange(option)}
          onSelect={(e: Event) => {
            e.preventDefault();
          }}
          disabled={option.disabled || disabled}
          textValue={option.label}
          style={
            option.color
              ? ({
                  "--custom-color": option.color,
                } as CSSProperties)
              : {}
          }
          className={clsx(
            "group/item flex items-center rounded-xs leading-none",
            "relative min-h-7 min-w-0 px-1.25 py-1 pl-7.5 text-sm outline-hidden select-none",
            "data-disabled:pointer-events-none",
            "variant-scope highlight-list-item",
            option.color ? "custom-color" : (option.variant ?? variant),
          )}
        >
          <ItemIndicatorComponent
            forceMount
            className={clsx(
              "absolute top-1/2 left-1 grid -translate-y-1/2 place-items-center",
              "variant-scope check-indicator",
              option.color ? "custom-color" : (option.variant ?? variant),
            )}
          >
            <span className="icon-slot">
              {resolveIcon(option.icon) ||
                (state === CheckboxState.Checked ? (
                  <Icon name="check" />
                ) : (
                  <Icon name="point" />
                ))}
            </span>
          </ItemIndicatorComponent>
          <span className="block min-w-0 truncate">{option.label}</span>
        </ItemComponent>
      );
    }
  };

  return (
    <GroupComponent
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
      }}
    >
      {options.map((option) => renderTreeNode(option))}
    </GroupComponent>
  );
}
