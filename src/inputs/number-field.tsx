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
import { NumericStatus } from "../hooks/numeric-utils";
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
      onChangeHeadless,
      onBlur,
    } = useNumeric({
      initial: value,
      onValidChange: onChange,
      min,
      max,
      enforceLimits: strict,
    });

    useEffect(() => {
      if (focusState !== FocusState.Focused) {
        onChangeHeadless(value);
      }
    }, [value, focusState, onChangeHeadless]);

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
          "py-0 px-0.5 group/input-wrapper select-none",
          label && units && "input-label-field-units-grid",
          label && !units && "input-label-field-grid",
          !label && units && "input-field-units-grid",
          !label && !units && "input-field-grid",
          "sized-height rounded-xs place-items-center",
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
              "responsive grid-area-label sized-text place-items-center text-left px-0.5 rounded-[1px]",
              "sized-inner-group-item font-mono variant-text-caret-color group-has-focus/input-wrapper:bg-neutral-900/20",
              "text-white/50 focus:outline-none focus:text-white/75 dark:focus:text-white/75",
              "select-none group-has-focus/input-wrapper:pointer-events-auto group-has-focus/input-wrapper:select-auto",
              "pointer-events-none transition-discrete transition-all delay-75",
              // Show ellipsis when the text gets too long
              "truncate px-1 flex-none",
            )}
          />
        )}

        <input
          ref={inputRef}
          {...forwardedProps}
          id={id}
          value={textValue}
          onChange={onChangeInner}
          className={clsx(
            "responsive grid-area-field w-full min-w-0",
            "focus:outline-hidden",
            "disabled:cursor-not-allowed cursor-text",
            "sized-text sized-height text-right px-0.5",
            "variant-text-caret-color font-mono",
            size,
            effectiveColor ? "custom-color" : effectiveVariant,
            subtle &&
              "dark:focus:text-white focus:text-black text-neutral-600 dark:text-neutral-400",
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
              "grid-area-units text-right select-none pl-0.5 pr-2",
              "grid place-items-center pointer-events-none sized-text",
              "sized-height text-white/50 font-mono flex-none",
            )}
          />
        )}
      </label>
    );
  },
);

InnerNumberField.displayName = "NumberField";

export const NumberField = memo(InnerNumberField);
