import { CSSProperties } from "react";
import { clsx } from "clsx";
// Will hopefully use later once we can search in the select.
// import { matchSorter } from "match-sorter";
import { Size, Variant } from "../types";
import { Icon, resolveIcon, type IconValue } from "../icons/registry";
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
 * @param {IconValue} icon - The icon to display in the option (registry key or node)
 */
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  color?: string;
  variant?: Variant;
  icon?: IconValue;
  /**
   * What choosing this option means, shown as a TOOLTIP on the option in the open menu.
   *
   * A tooltip rather than a second line of text in the item, because an item that grows
   * to two lines stops matching the interactive behaviour and rhythm of every other row
   * in the menu, and forces the menu's sizing around explanatory prose. This keeps the
   * option exactly the control it was and layers the explanation over it.
   *
   * The trigger never renders it — the trigger shows the selected state.
   *
   * Hover- and focus-driven, so it is an AID rather than the only place a fact lives.
   * Anything a user must know to choose correctly belongs in the label, or beside the
   * control where it is always visible.
   */
  description?: string;
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
  /**
   * Present but not changeable: the menu will not open, and the trigger dims to say so.
   *
   * For a value the user may **see** and may not **set** — a rung pinned by a plan or a
   * policy, a field owned by another actor. Distinct from omitting the control, which
   * says the value does not apply, and from rendering plain text, which hides that a
   * control was ever there. A reader who cannot tell the difference between "no setting"
   * and "a setting you may not change" will assume the former and stop looking.
   *
   * Deliberately **not** `pointer-events-none`, unlike the disabled state on menu items.
   * Radix already refuses to open a disabled trigger, so suppressing pointer events buys
   * nothing — and it would stop a `Tooltip` over this control from ever firing, which is
   * the one affordance left for explaining *why* it is disabled. Disabling a control and
   * withholding the reason is worse than either alone.
   *
   * **To attach that tooltip, wrap this in an element — not the `Select` directly.**
   * `Tooltip` uses Radix's `asChild`, which hands its trigger's ref and pointer handlers
   * to its child; `Select` is a plain function component that forwards neither, so they
   * are silently dropped and the tooltip simply never opens. There is no error and the
   * control looks correct. Verified in `select-disabled.browser.tsx`:
   *
   * ```tsx
   * <Tooltip content="Why this is fixed">
   *   <span className="inline-flex">
   *     <Select … disabled />
   *   </span>
   * </Tooltip>
   * ```
   */
  disabled?: boolean;
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
  disabled = false,
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
            icon: <Icon name="point-filled" />,
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
            icon: <Icon name="layout-grid" />,
            variant: variant ?? Variant.Default,
          };
        }
        return {
          value: "",
          label: `${String(selectedOptions.length)} selected`,
          icon: <Icon name="layout-grid" />,
          variant: variant ?? Variant.Default,
        };
      })()
    : options.find((o) => o.value === value);

  const triggerHeightClass = resolveHeightSizingClass(sizing);
  const triggerBoxClass = resolveBoxSizingClass(sizing);

  const renderSingleOption = (selectOption?: SelectOption) => {
    // Keyed off `data-disabled`, which Radix stamps on a disabled trigger and which
    // `asChild` puts on this element — so the appearance follows the primitive's own
    // state rather than a second copy of the prop that could disagree with it.
    //
    // `text-neutral-500/50` matches the dimming menu items already use for disabled, so a
    // pinned trigger and a disabled option read as the same state. No `pointer-events-none`
    // here on purpose; see the `disabled` prop's doc.
    const DISABLED_TRIGGER_CLASS =
      "data-disabled:cursor-not-allowed data-disabled:text-neutral-500/50";

    // The label and the indicator need the dim stated ON THEM, not inherited.
    //
    // Setting a colour on the trigger alone looks right in the markup and does nothing on
    // screen: the label span carries `highlight-list-item` and the indicator goes through
    // `StaticIcon`, both of which set their own colour, so an ancestor's `text-*` never
    // reaches the pixels a reader actually sees. Caught by rendering the Storybook story
    // and measuring — the disabled and enabled labels came back the identical
    // `oklch(0.439 0 0)`.
    //
    // `group/trigger` is already on this element (Radix's trigger sets it and `asChild`
    // merges it here), which is what these hang off.
    // Written as `group-data-[disabled]` rather than composing the package's
    // `data-disabled` custom variant with `group-`. The custom variant works on its own
    // (the trigger above uses it) but does not compose into the named-group form, and the
    // failure is silent — no class is emitted and the text simply never dims.
    const DISABLED_CONTENT_CLASS = "group-data-[disabled]/trigger:text-neutral-500/50";
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
            "responsive variant-mock-item-bg rounded-xs",
            "variant-responsive-text variant-responsive-appearing-outline",
            "flex items-center justify-center p-0",
            triggerBoxClass,
            size,
            selectOption?.color ? "custom-color" : (selectOption?.variant ?? Variant.Default),
            DISABLED_TRIGGER_CLASS,
            className,
          )}
        >
          <Tooltip content={tooltipContent}>
            <div className={clsx("icon-slot", DISABLED_CONTENT_CLASS)}>
              {resolveIcon(selectOption?.icon) || <Icon name="point-filled" />}
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
          "responsive variant-mock-item-bg rounded-xs",
          "variant-responsive-text variant-responsive-appearing-outline",
          "flex min-w-0 flex-1 flex-row items-center pr-0 pl-1",
          triggerHeightClass,
          size,
          selectOption?.color ? "custom-color" : (selectOption?.variant ?? Variant.Default),
          DISABLED_TRIGGER_CLASS,
          className,
        )}
      >
        <div
          className={clsx(
            "flex min-w-0 flex-1 flex-row items-center justify-center",
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
                {resolveIcon(selectOption?.icon) || <Icon name="point-filled" />}
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
              "flex min-w-0 flex-1 items-center",
              "responsive highlight-list-item",
              triggerHeightClass,
              "sized-text",
              showIcon ? "pr-0 pl-3" : "pr-0 pl-2",
              selectOption?.color ? "custom-color" : Variant.Default,
              DISABLED_CONTENT_CLASS,
            )}
          >
            <span className="truncate">{selectOption?.label ?? label}</span>
          </span>

          <StaticIcon
            size={size}
            className={clsx("sized-text sized-width", DISABLED_CONTENT_CLASS)}
            variant={selectOption?.variant}
          >
            <Icon name="select-indicator" />
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
          disabled={disabled}
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
        <div className="flex w-full flex-wrap gap-1">
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
