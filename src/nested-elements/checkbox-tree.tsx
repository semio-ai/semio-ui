import { Menu } from "@base-ui/react/menu";
import { type MouseEvent, type CSSProperties, type ReactNode, useCallback, useId } from "react";
import { clsx } from "clsx";
import { Icon, resolveIcon, type IconValue } from "../icons/registry";
import { Variant } from "../types";
import { preserveMenuInteraction, useFirstMenuEntryFocus } from "../floating/menu-action";

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

const checkboxIcons = {
  [CheckboxState.Checked]: "selected",
  [CheckboxState.Unchecked]: "unselected",
  [CheckboxState.Indeterminate]: "selection-indeterminate",
} as const;

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
  const treeId = useId();

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
        <TreeSubmenu
          key={option.value}
          id={`${treeId}-${option.value}`}
          variant={option.variant ?? variant}
          trigger={
            <Menu.SubmenuTrigger
              id={`${treeId}-${option.value}`}
              disabled={option.disabled || disabled}
              className={clsx(
                "group/item",
                "flex items-center rounded-xs leading-none",
                "relative min-h-7 min-w-0 px-1.25 py-1 pl-7.5 text-sm outline-hidden select-none",

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
              onKeyDown={(event) => {
                if (event.target === event.currentTarget && event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  // Stop submenu and composite activation, which otherwise synthesize
                  // an opening click. Space on the row owns only the parent check.
                  event.preventBaseUIHandler();
                  handleCheckboxChange(option);
                }
              }}
              render={(props) => <div {...props} data-state={state} />}
            >
              <div
                data-state={state}
                aria-disabled={option.disabled || disabled || undefined}
                role="checkbox"
                aria-checked={(() => {
                  if (state === CheckboxState.Checked) return "true";
                  if (state === CheckboxState.Indeterminate) return "mixed";
                  return "false";
                })()}
                tabIndex={-1}
                // List navigation's bubbling onFocus would refocus the parent row;
                // then its Space/Enter handler would open the submenu. A scripted
                // checkbox focus must stay on the checkbox and own its activation.
                onFocus={(event) => event.stopPropagation()}
                className={clsx(
                  "absolute top-1/2 left-1 grid -translate-y-1/2 cursor-pointer place-items-center",
                  "variant-scope check-indicator",
                  option.color ? "custom-color" : (option.variant ?? variant),
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!option.disabled && !disabled) handleCheckboxChange(option);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!option.disabled && !disabled) handleCheckboxChange(option);
                  }
                }}
              >
                <span className="icon-slot">
                  {resolveIcon(option.icon) || <Icon name={checkboxIcons[state]} />}
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
            </Menu.SubmenuTrigger>
          }
        >
          {option.children?.map((child) => renderTreeNode(child))}
        </TreeSubmenu>
      );
    } else {
      // Render as leaf checkbox item
      return (
        <Menu.CheckboxItem
          render={(props, itemState) => (
            <div {...props} data-state={itemState.checked ? "checked" : "unchecked"} />
          )}
          key={option.value}
          checked={state === CheckboxState.Checked}
          onCheckedChange={() => handleCheckboxChange(option)}
          closeOnClick={false}
          disabled={option.disabled || disabled}
          label={option.label}
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

            "variant-scope highlight-list-item",
            option.color ? "custom-color" : (option.variant ?? variant),
          )}
        >
          <Menu.CheckboxItemIndicator
            render={(props, itemState) => (
              <span {...props} data-state={itemState.checked ? "checked" : "unchecked"} />
            )}
            keepMounted
            className={clsx(
              "absolute top-1/2 left-1 grid -translate-y-1/2 place-items-center",
              "variant-scope check-indicator",
              option.color ? "custom-color" : (option.variant ?? variant),
            )}
          >
            <span className="icon-slot">
              {resolveIcon(option.icon) ||
                (state === CheckboxState.Checked ? (
                  <Icon name="selected" />
                ) : (
                  <Icon name="unselected" />
                ))}
            </span>
          </Menu.CheckboxItemIndicator>
          <span className="block min-w-0 truncate">{option.label}</span>
        </Menu.CheckboxItem>
      );
    }
  };

  return (
    <Menu.Group
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
      }}
    >
      {options.map((option) => renderTreeNode(option))}
    </Menu.Group>
  );
}

/** Each tree level corrects its own initial keyboard focus independently. */
function TreeSubmenu({
  id,
  variant,
  trigger,
  children,
}: {
  id: string;
  variant?: Variant;
  trigger: ReactNode;
  children: ReactNode;
}) {
  const firstEntryFocus = useFirstMenuEntryFocus();
  return (
    <Menu.SubmenuRoot
      loopFocus={false}
      onOpenChange={(next, details) => {
        if (!next) preserveMenuInteraction(details);
        firstEntryFocus.onOpenChange(next, details);
      }}
    >
      {trigger}
      <Menu.Portal>
        <Menu.Positioner side="right" collisionPadding={0}>
          <Menu.Popup
            onFocus={firstEntryFocus.onFocus}
            finalFocus={(type) => (type === "keyboard" ? document.getElementById(id) : false)}
            render={(props, state) => (
              <div {...props} data-state={state.open ? "open" : "closed"} />
            )}
            className={clsx(
              "variant-scope card-overlay dropdown-content min-w-55 p-0.5 [outline:none]",
              variant,
            )}
          >
            <Menu.Group>{children}</Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  );
}
