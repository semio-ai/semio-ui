import {
  memo,
  useState,
  useEffect,
  type ReactNode,
  forwardRef,
  ForwardedRef,
  useRef,
  CSSProperties,
  useMemo,
  MutableRefObject,
} from "react";
import { enableBoundaryChecking } from "number-precision";
import { useHover } from "@use-gesture/react";
import { clsx } from "clsx";
import { mergeRefs } from "react-merge-refs";
import { useNumeric, ValidChangeEvent } from "../hooks/use-numeric";
import { NumericStatus, formatDisplayValue } from "../hooks/numeric-utils";
import { Size, Variant } from "../types";
import { TextFieldProps } from "./text-field";

enableBoundaryChecking(false);

enum FocusState {
  Focused,
  FocusedLabel,
  Blurred,
}

export interface NumberFieldProps
  extends Omit<TextFieldProps, "onChange" | "value" | "onClear" | "icon"> {
  value: number;
  onChange: (value: number, event: ValidChangeEvent) => void;
  min?: number;
  max?: number;
  units?: string;
  strict?: boolean;
  highlight?: boolean;
  label?: string;
  onLabelChange?: (label: string) => void;
  onHighlightChange?: (isHighlighted: boolean) => void;
  onStatusChange?: (status: NumericStatus) => void;
  autoOverrideVariantOnWarning?: boolean;
}

/**
 * NumberField
 * {@link TextFieldProps}
 * @param value - the value of the field
 * @param onChange - the function to call when the value changes
 * @param min - the minimum value
 * @param max - the maximum value
 * @param units - the units to display
 * @param strict - whether to enforce the min/max bounds
 * @param highlighted - whether the field is emphasized
 * @param label - the label of the field
 * @param onLabelChange - the function to call when the label changes
 * @param onHighlightChange - the function to call when the emphasis changes
 * @param onStatusChange - the function to call when the validation status changes
 * @param autoOverrideVariantOnWarning - whether to automatically override variant for warning states
 */
const InnerNumberField = forwardRef(
  (
    {
      bg = true,
      outline = "interact",
      value,
      variant,
      onChange,
      min,
      max,
      units,
      color,
      strict = false,
      subtle = false,
      size = Size.Md,
      disabled = false,
      highlight = false,
      onHighlightChange,
      label,
      onLabelChange,
      onStatusChange,
      autoOverrideVariantOnWarning = false,
      onBlur: onBlurExternal,
      onFocus: onFocusExternal,
      className,
      ...forwardedProps
    }: NumberFieldProps,
    ref: ForwardedRef<HTMLInputElement>,
  ): ReactNode => {
    const labelRef = useRef<HTMLInputElement>(null);
    const defaultInputRef = useRef<HTMLInputElement>(null);

    const inputRef = mergeRefs<HTMLInputElement>([defaultInputRef, ref]);

    const [focusState, setFocusState] = useState(FocusState.Blurred);
    const hoverRef = useRef<boolean>(false);

    const id = useMemo(() => {
      return forwardedProps.id ?? crypto.randomUUID();
    }, [forwardedProps.id]);

    const {
      textValue,
      status,
      onChange: onChangeInner,
      onBlur,
    } = useNumeric({
      initial: value,
      onValidChange: onChange,
      min,
      max,
      enforceLimits: strict,
    });

    // Display the formatted prop value when not focused; useNumeric's
    // local textValue is only consulted while the user is typing. The
    // previous sync-via-useEffect pattern fired a setState every render,
    // which fed React 19's nestedPassiveUpdateCount and tripped
    // "Maximum update depth exceeded" once per ~50 playback ticks.
    const displayedTextValue =
      focusState === FocusState.Focused ? textValue : formatDisplayValue(value, 2);

    useEffect(() => {
      onStatusChange?.(status);
    }, [status, onStatusChange]);

    const bind = useHover((state) => {
      if (state.hovering) {
        hoverRef.current = true;
        onHighlightChange?.(true);
      } else if (focusState === FocusState.Blurred) {
        hoverRef.current = false;
        onHighlightChange?.(false);
      } else {
        hoverRef.current = false;
      }
    });

    // Auto-override variant for warning states
    const [effectiveColor, effectiveVariant] = useMemo(() => {
      if (autoOverrideVariantOnWarning) {
        if (
          status === NumericStatus.Above ||
          status === NumericStatus.Below ||
          status === NumericStatus.Invalid
        ) {
          return [undefined, Variant.Error];
        }
      }
      return [color, variant];
    }, [autoOverrideVariantOnWarning, status, variant, color]);

    return (
      <label
        htmlFor={id}
        {...bind}
        data-highlighted={highlight || focusState !== FocusState.Blurred ? "" : undefined}
        style={{ "--custom-color": effectiveColor, "--progress": "25%" } as CSSProperties}
        className={clsx(
          "responsive",
          effectiveColor ? "custom-color" : effectiveVariant,
          "group/input-wrapper px-0.5 py-0 select-none",
          label && units && "input-label-field-units-grid",
          label && !units && "input-label-field-grid",
          !label && units && "input-field-units-grid",
          !label && !units && "input-field-grid",
          "sized-height place-items-center rounded-xs",
          bg && "variant-input-solid-bg",
          outline === "interact" && "variant-responsive-appearing-outline",
          outline === "always" && "variant-responsive-persistent-outline",
          size,
          className,
        )}
      >
        {label && (
          <input
            ref={labelRef}
            value={label}
            onChange={(e) => onLabelChange?.(e.target.value)}
            readOnly={!onLabelChange}
            style={{ width: `min(100px,${(label.length + 2).toString()}ch)` }}
            onKeyDown={(e) => {
              if (!disabled && e.key === "Enter") {
                setFocusState(FocusState.Blurred);
                onBlurExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
                labelRef.current?.blur();
              }
            }}
            onBlur={(e) => {
              if (!disabled) {
                setFocusState(FocusState.Blurred);
                onBlurExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
              }
            }}
            onClick={(e) => {
              if (disabled) return;
              if (focusState !== FocusState.FocusedLabel) {
                onFocusExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
                setFocusState(FocusState.FocusedLabel);
              }
              e.stopPropagation();
            }}
            className={clsx(
              effectiveColor ? "custom-color" : effectiveVariant,
              size,
              "responsive grid-area-label sized-text place-items-center rounded-[1px] px-0.5 text-left",
              "sized-inner-group-item variant-text-caret-color font-mono group-has-focus/input-wrapper:bg-neutral-900/20",
              "text-white/50 focus:text-white/75 focus:outline-none dark:focus:text-white/75",
              "select-none group-has-focus/input-wrapper:pointer-events-auto group-has-focus/input-wrapper:select-auto",
              "pointer-events-none transition-all transition-discrete delay-75",
              // Show ellipsis when the text gets too long
              "flex-none truncate px-1",
            )}
          />
        )}

        <input
          ref={inputRef}
          {...forwardedProps}
          id={id}
          value={displayedTextValue}
          onChange={onChangeInner}
          className={clsx(
            "responsive grid-area-field w-full min-w-0",
            "focus:outline-hidden",
            "cursor-text disabled:cursor-not-allowed",
            "sized-text sized-height px-0.5 text-right",
            "variant-text-caret-color font-mono",
            size,
            effectiveColor ? "custom-color" : effectiveVariant,
            subtle &&
              "text-neutral-600 focus:text-black dark:text-neutral-400 dark:focus:text-white",
            !subtle && "text-black dark:text-white",
            className,
          )}
          onKeyDown={(e) => {
            if (!disabled && e.key === "Enter") {
              setFocusState(FocusState.Blurred);
              onBlur(e);
              onBlurExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
              (ref as MutableRefObject<HTMLInputElement>)?.current?.blur();
            }
          }}
          onBlur={(e) => {
            if (!disabled) {
              setFocusState(FocusState.Blurred);
              onBlur(e);
              onBlurExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
            }
          }}
          onClick={(e) => {
            if (disabled) return;
            if (focusState !== FocusState.Focused) {
              onFocusExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
              setFocusState(FocusState.Focused);
            }
            e.stopPropagation();
          }}
        />

        {units && (
          <input
            value={units}
            readOnly
            style={{ width: `${(units.length + 2).toString()}ch` }}
            className={clsx(
              effectiveVariant,
              size,
              "grid-area-units pr-2 pl-0.5 text-right select-none",
              "sized-text pointer-events-none grid place-items-center",
              "sized-height flex-none font-mono text-white/50",
            )}
          />
        )}
      </label>
    );
  },
);

InnerNumberField.displayName = "NumberField";

export const NumberField = memo(InnerNumberField);
