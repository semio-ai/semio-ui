import { type CSSProperties, type ReactNode, type Ref, useId, useMemo } from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { clsx } from "clsx";
import { Icon, resolveIcon, type IconValue } from "../icons/registry";
import { Size, Variant } from "../types";
import { ScrollArea } from "../layouts/scroll-area";
import {
  emptyClassName,
  groupLabelClassName,
  inputClassName,
  inputGroupClassName,
  itemClassName,
  itemIndicatorClassName,
  leftIconClassName,
  listClassName,
  popupClassName,
  popupScrollWrapperClassName,
  popupViewportClassName,
  positionerClassName,
  rightChevronClassName,
  statusClassName,
} from "./combobox-shared";

export interface ComboboxOption<TValue extends string = string> {
  label: string;
  value: TValue;
  disabled?: boolean;
  color?: string;
  variant?: Variant;
  icon?: IconValue;
}

export interface ComboboxGroup<TValue extends string = string> {
  label: string;
  items: ComboboxOption<TValue>[];
}

export type ComboboxItems<TValue extends string = string> =
  | ComboboxOption<TValue>[]
  | ComboboxGroup<TValue>[];

export interface ComboboxItemState {
  highlighted: boolean;
  disabled: boolean;
  selected: boolean;
}

export interface ComboboxProps<TValue extends string = string> {
  options: ComboboxItems<TValue>;
  value: TValue | null;
  onChange: (value: TValue | null) => void;
  /** Ref to the underlying input element (for programmatic focus, etc.). React 19+:
   *  `ref` arrives as an ordinary prop, so this is not supported on React 18. */
  ref?: Ref<HTMLInputElement>;
  placeholder?: string;
  size?: Size;
  variant?: Variant;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Show a left-side icon. Defaults to the selected option's icon (if any). */
  leftIcon?: IconValue;
  bg?: boolean;
  outline?: "hidden" | "interact" | "always";
  emptyContent?: ReactNode;
  /** Custom item renderer. Defaults to icon + label. */
  renderItem?: (option: ComboboxOption<TValue>, state: ComboboxItemState) => ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  name?: string;
  className?: string;
  inputClassName?: string;
  /**
   * Extra classes for the **Popup** — the element carrying the surface: fill, radius,
   * shadow, padding, max-height.
   *
   * Not the Positioner above it, which is the `position: absolute` element. So a
   * `z-index` here is inert, and there is nothing on the Positioner for it to reach:
   * that element carries no `z-index` at all. Stacking is the host's, via
   * `portalContainer`.
   */
  popupClassName?: string;
  /** Custom container for the popup portal (e.g. inside a modal). */
  portalContainer?: HTMLElement | null;
}

export function Combobox<TValue extends string>({
  options,
  value,
  onChange,
  ref,
  placeholder = "Select…",
  size = Size.Md,
  variant = Variant.Default,
  disabled = false,
  readOnly = false,
  required = false,
  leftIcon,
  bg = true,
  outline = "interact",
  emptyContent = "No matches",
  renderItem,
  open,
  defaultOpen,
  onOpenChange,
  id,
  name,
  className,
  inputClassName: inputClassNameProp,
  popupClassName: popupClassNameProp,
  portalContainer,
}: ComboboxProps<TValue>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const grouped = isGroupedOptions(options);

  const flatOptions = useMemo<ComboboxOption<TValue>[]>(
    () =>
      grouped
        ? (options as ComboboxGroup<TValue>[]).flatMap((g) => g.items)
        : (options as ComboboxOption<TValue>[]),
    [grouped, options],
  );

  const selectedOption = useMemo(
    () => flatOptions.find((option) => option.value === value) ?? null,
    [flatOptions, value],
  );

  const resolvedLeftIcon = leftIcon === undefined ? (selectedOption?.icon ?? null) : leftIcon;

  return (
    <ComboboxPrimitive.Root<ComboboxOption<TValue>, false>
      // **Grouped options reach the root AS GROUPS**, and flat ones flat.
      //
      // `List`'s children function iterates whatever the ROOT was given, so this
      // prop decides what the grouped branch below receives. Handed a flat list it
      // is called with OPTIONS where it expects groups: `group.label` is undefined
      // and `group.items` is undefined, so every heading renders empty while the
      // options themselves still list — grouping that silently degrades to none.
      //
      // Passing groups is safe for the callbacks under them. base-ui detects a
      // group by the presence of an `items` array (`isGroupedItems`), flattens
      // them for its own store, and applies `itemToStringLabel`/`itemToStringValue`
      // to the LEAVES. It also filters per group and drops a group whose items all
      // filter out, which is why an empty group renders nothing rather than a
      // heading over a void.
      items={grouped ? (options as ComboboxGroup<TValue>[]) : flatOptions}
      value={selectedOption}
      onValueChange={(next) => {
        if (next == null) {
          onChange(null);
          return;
        }
        onChange(next.value);
      }}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      autoHighlight
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.value}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxPrimitive.InputGroup
        className={clsx(inputGroupClassName(size), className)}
        style={
          selectedOption?.color
            ? ({ "--custom-color": selectedOption.color } as CSSProperties)
            : undefined
        }
      >
        {resolvedLeftIcon != null && (
          <span
            className={leftIconClassName(size, selectedOption?.variant ?? variant)}
            aria-hidden="true"
          >
            {resolveIcon(resolvedLeftIcon)}
          </span>
        )}
        <ComboboxPrimitive.Input
          ref={ref}
          id={inputId}
          placeholder={placeholder}
          className={clsx(
            inputClassName(size, selectedOption?.variant ?? variant, {
              bg,
              outline,
              readOnly,
              leftPadded: resolvedLeftIcon != null,
              rightPadded: true,
            }),
            inputClassNameProp,
          )}
        />
        <ComboboxPrimitive.Trigger
          className={rightChevronClassName(size, variant)}
          aria-label="Toggle options"
        >
          <Icon name="select-indicator" />
        </ComboboxPrimitive.Trigger>
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal container={portalContainer ?? undefined}>
        <ComboboxPrimitive.Positioner
          sideOffset={4}
          align="center"
          className={positionerClassName()}
        >
          <ComboboxPrimitive.Popup
            className={popupClassName({ variant, extras: popupClassNameProp })}
          >
            <ComboboxPrimitive.Status className={statusClassName()} />
            <ScrollArea
              orientation="vertical"
              shrinkHeight
              wrapperClassName={popupScrollWrapperClassName()}
              className={popupViewportClassName()}
            >
              {grouped ? (
                <ComboboxPrimitive.List className={listClassName()}>
                  {(group: ComboboxGroup<TValue>) => (
                    <ComboboxPrimitive.Group
                      key={group.label}
                      items={group.items as readonly ComboboxOption<TValue>[]}
                    >
                      <ComboboxPrimitive.GroupLabel className={groupLabelClassName()}>
                        {group.label}
                      </ComboboxPrimitive.GroupLabel>
                      <ComboboxPrimitive.Collection>
                        {(option: ComboboxOption<TValue>) => (
                          <ComboboxItemRow
                            key={option.value}
                            option={option}
                            variant={variant}
                            renderItem={renderItem}
                            isSelected={option.value === value}
                          />
                        )}
                      </ComboboxPrimitive.Collection>
                    </ComboboxPrimitive.Group>
                  )}
                </ComboboxPrimitive.List>
              ) : (
                <ComboboxPrimitive.List className={listClassName()}>
                  {(option: ComboboxOption<TValue>) => (
                    <ComboboxItemRow
                      key={option.value}
                      option={option}
                      variant={variant}
                      renderItem={renderItem}
                      isSelected={option.value === value}
                    />
                  )}
                </ComboboxPrimitive.List>
              )}
              <ComboboxPrimitive.Empty>
                <div className={emptyClassName()}>{emptyContent}</div>
              </ComboboxPrimitive.Empty>
            </ScrollArea>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}

function ComboboxItemRow<TValue extends string>({
  option,
  variant,
  renderItem,
  isSelected,
}: {
  option: ComboboxOption<TValue>;
  variant: Variant;
  renderItem?: (option: ComboboxOption<TValue>, state: ComboboxItemState) => ReactNode;
  isSelected: boolean;
}) {
  const itemVariant = option.variant ?? variant;
  return (
    <ComboboxPrimitive.Item
      value={option}
      disabled={option.disabled}
      style={option.color ? ({ "--custom-color": option.color } as CSSProperties) : undefined}
      className={itemClassName({ variant: itemVariant, color: option.color })}
      render={(props, state) => (
        <div {...props} data-state={isSelected ? "checked" : "unchecked"}>
          <span className={itemIndicatorClassName({ variant: itemVariant, color: option.color })}>
            <span className="icon-slot">
              {resolveIcon(option.icon) ?? <Icon name="option-placeholder" />}
            </span>
          </span>
          {renderItem
            ? renderItem(option, {
                highlighted: state.highlighted,
                disabled: state.disabled,
                selected: isSelected,
              })
            : option.label}
        </div>
      )}
    />
  );
}

function isGroupedOptions<TValue extends string>(
  options: ComboboxItems<TValue>,
): options is ComboboxGroup<TValue>[] {
  return options.length > 0 && Array.isArray((options[0] as ComboboxGroup<TValue>).items);
}
