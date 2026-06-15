import { type ReactNode, type Ref, useEffect, useId } from "react";
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { clsx } from "clsx";
import { Icon } from "../icons/registry";
import { Size, Variant } from "../types";
import { ScrollArea } from "../layouts/scroll-area";
import {
  emptyClassName,
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
  rightButtonClassName,
  statusClassName,
} from "./combobox-shared";

export interface AutocompleteItemState {
  highlighted: boolean;
  disabled: boolean;
}

export interface AutocompleteProps<TItem> {
  items: TItem[];
  value: string;
  onChange: (value: string) => void;
  /**
   * Fires after `value` has been stable for `debounceMs`. Useful for triggering
   * a backend search without firing on every keystroke. When `debounceMs` is 0
   * (the default), this fires synchronously alongside `onChange`. Pass a stable
   * callback (e.g. from `useState`/`useCallback`) to avoid re-scheduling.
   */
  onDebouncedChange?: (value: string) => void;
  /** Delay in milliseconds before `onDebouncedChange` fires. Defaults to 0. */
  debounceMs?: number;
  onSelect: (item: TItem) => void;
  renderItem: (item: TItem, state: AutocompleteItemState) => ReactNode;
  getItemKey: (item: TItem) => string;
  getItemDisabled?: (item: TItem) => boolean;
  /**
   * Icon shown in the left indicator slot of each row. Mirrors the icon-slot
   * styling used by `Select`/`NestedRadio` so popups feel consistent. If
   * omitted, a small bullet renders in the indicator.
   */
  getItemIcon?: (item: TItem) => ReactNode;
  /** Ref to the underlying input element (for programmatic focus, etc.). */
  ref?: Ref<HTMLInputElement>;
  placeholder?: string;
  size?: Size;
  variant?: Variant;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Left-side icon. Defaults to a search icon. Pass `null` to omit. */
  leftIcon?: ReactNode | null;
  /** Background fill on the input. Defaults to true. */
  bg?: boolean;
  outline?: "hidden" | "interact" | "always";
  /** Show a loading row while results are pending. */
  loading?: boolean;
  loadingContent?: ReactNode;
  /** Shown when `items` is empty (and not loading). */
  emptyContent?: ReactNode;
  /** Externally controlled open state. If omitted, base-ui manages it. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  name?: string;
  className?: string;
  inputClassName?: string;
  popupClassName?: string;
  /** Custom container for the popup portal (e.g. inside a modal). */
  portalContainer?: HTMLElement | null;
}

export function Autocomplete<TItem>({
  items,
  value,
  onChange,
  onDebouncedChange,
  debounceMs = 0,
  onSelect,
  renderItem,
  getItemKey,
  getItemDisabled,
  getItemIcon,
  ref,
  placeholder,
  size = Size.Md,
  variant = Variant.Default,
  disabled = false,
  readOnly = false,
  required = false,
  leftIcon,
  bg = true,
  outline = "interact",
  loading = false,
  loadingContent = "Searching…",
  emptyContent = "No results",
  open,
  defaultOpen,
  onOpenChange,
  id,
  name,
  className,
  inputClassName: inputClassNameProp,
  popupClassName: popupClassNameProp,
  portalContainer,
}: AutocompleteProps<TItem>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const showClear = value.length > 0 && !disabled && !readOnly;
  const resolvedLeftIcon =
    leftIcon === undefined ? <Icon name="search" /> : leftIcon;

  useEffect(() => {
    if (!onDebouncedChange) {
      return;
    }
    if (debounceMs <= 0) {
      onDebouncedChange(value);
      return;
    }
    const handle = window.setTimeout(() => {
      onDebouncedChange(value);
    }, debounceMs);
    return () => {
      window.clearTimeout(handle);
    };
  }, [value, debounceMs, onDebouncedChange]);

  return (
    <AutocompletePrimitive.Root
      mode="none"
      items={items}
      value={value}
      onValueChange={(next) => onChange(next)}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      autoHighlight
      openOnInputClick
    >
      <AutocompletePrimitive.InputGroup
        className={clsx(inputGroupClassName(size), className)}
      >
        {resolvedLeftIcon != null && (
          <span className={leftIconClassName(size, variant)} aria-hidden="true">
            {resolvedLeftIcon}
          </span>
        )}
        <AutocompletePrimitive.Input
          ref={ref}
          id={inputId}
          placeholder={placeholder}
          className={clsx(
            inputClassName(size, variant, {
              bg,
              outline,
              readOnly,
              leftPadded: resolvedLeftIcon != null,
              rightPadded: showClear,
            }),
            inputClassNameProp,
          )}
        />
        {showClear && (
          <AutocompletePrimitive.Clear
            className={rightButtonClassName(size, variant)}
            aria-label="Clear search"
          >
            <Icon name="x" />
          </AutocompletePrimitive.Clear>
        )}
      </AutocompletePrimitive.InputGroup>

      <AutocompletePrimitive.Portal container={portalContainer ?? undefined}>
        <AutocompletePrimitive.Positioner
          sideOffset={4}
          align="center"
          className={positionerClassName()}
        >
          <AutocompletePrimitive.Popup
            className={popupClassName({ variant, extras: popupClassNameProp })}
            data-loading={loading ? "true" : undefined}
          >
            <AutocompletePrimitive.Status className={statusClassName()}>
              {loading ? loadingContent : null}
            </AutocompletePrimitive.Status>
            <ScrollArea
              orientation="vertical"
              shrinkHeight
              wrapperClassName={popupScrollWrapperClassName()}
              className={popupViewportClassName()}
            >
              {loading && (
                <div className={emptyClassName()} aria-hidden="true">
                  {loadingContent}
                </div>
              )}
              <AutocompletePrimitive.List className={listClassName()}>
                {items.map((item) => {
                  const itemDisabled = getItemDisabled?.(item) ?? false;
                  return (
                    <AutocompletePrimitive.Item
                      key={getItemKey(item)}
                      value={item}
                      disabled={itemDisabled}
                      onClick={() => onSelect(item)}
                      className={itemClassName({ variant })}
                      render={(props, state) => (
                        <div {...props} data-state="unchecked">
                          <span className={itemIndicatorClassName({ variant })}>
                            <span className="icon-slot">
                              {getItemIcon?.(item) ?? (
                                <Icon name="point-filled" />
                              )}
                            </span>
                          </span>
                          {renderItem(item, {
                            highlighted: state.highlighted,
                            disabled: state.disabled,
                          })}
                        </div>
                      )}
                    />
                  );
                })}
              </AutocompletePrimitive.List>
              <AutocompletePrimitive.Empty>
                {!loading && <div className={emptyClassName()}>{emptyContent}</div>}
              </AutocompletePrimitive.Empty>
            </ScrollArea>
          </AutocompletePrimitive.Popup>
        </AutocompletePrimitive.Positioner>
      </AutocompletePrimitive.Portal>
    </AutocompletePrimitive.Root>
  );
}
