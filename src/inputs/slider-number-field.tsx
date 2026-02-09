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
} from "react";
import { enableBoundaryChecking, round } from "number-precision";
import { useGesture } from "@use-gesture/react";
import { mergeRefs } from "react-merge-refs";
import { clamp } from "lodash";
import { clsx } from "clsx";
import { useNumeric } from "../hooks/use-numeric";
import { NumericStatus } from "../hooks/numeric-utils";
import { Size, Variant } from "../types";
import { NumberFieldProps } from "./number-field";

enableBoundaryChecking(false);

const coerceModuloResult = (num: number) => (num < 0 ? num + 1 : num);
const WHEEL_CAPTURE_TIMEOUT_MS = 200;

enum FocusState {
  Focused, // The main input is focused
  Blurred, // Nothing is focused
  FocusedLabel, // The label is focused
  Dragging, // The slider is being dragged
}

export type SliderNumberFieldDragMode = "absolute" | "relative";

export interface SliderNumberFieldProps extends Omit<NumberFieldProps, "strict"> {
  visualMin?: number;
  visualMax?: number;
  strictSlider?: boolean;
  strictText?: boolean;
  dragMode?: SliderNumberFieldDragMode;
  onStatusChange?: (status: NumericStatus) => void;
  autoOverrideVariantOnWarning?: boolean;
  onDragStartNative?: (event: MouseEvent | PointerEvent, value: number) => void;
  onDragMoveNative?: (event: MouseEvent | PointerEvent, value: number) => void;
  onDragEndNative?: (event: MouseEvent | PointerEvent, value: number) => void;
}

/**
 * SliderNumberField
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
 * @param visualMin - the visual minimum (for wrap-around values);
 * @param visualMax - the visual maximum (for wrap-around values);
 * @param strictSlider - whether to enforce the min/max bounds on the slider
 * @param strictText - whether to enforce the min/max bounds
 * @param onStatusChange - the function to call when the validation status changes
 * @param autoOverrideVariantOnWarning - whether to automatically override variant for warning states
 */
const InnerSliderNumberField = forwardRef(
  (
    {
      bg = true,
      outline = "interact",
      value,
      variant,
      onChange,
      min,
      max,
      visualMin,
      visualMax,
      units,
      color,
      strictSlider = false,
      strictText = false,
      dragMode = "relative",
      subtle = false,
      size = Size.Md,
      disabled = false,
      highlight = false,
      onHighlightChange,
      label,
      onLabelChange,
      onBlur: onBlurExternal,
      onFocus: onFocusExternal,
      className,
      wrapperClassName,
      style: inputStyle,
      onStatusChange,
      autoOverrideVariantOnWarning = false,
      onDragStartNative,
      onDragMoveNative,
      onDragEndNative,
      ...forwardedProps
    }: SliderNumberFieldProps,
    ref: ForwardedRef<HTMLInputElement>,
  ): ReactNode => {
    const boundsRef = useRef<HTMLLabelElement>(null);
    const labelRef = useRef<HTMLInputElement>(null);
    const defaultInputRef = useRef<HTMLInputElement>(null);
    const lastDragValueRef = useRef<number>(value);
    const dragStartValueRef = useRef<number>(value);
    const wheelCaptureRef = useRef(false);
    const lastWheelTimeRef = useRef<number | null>(null);

    const inputRef = mergeRefs<HTMLInputElement>([defaultInputRef, ref]);

    const [focusState, setFocusState] = useState(FocusState.Blurred);

    const id = useMemo(() => {
      return forwardedProps.id ?? crypto.randomUUID();
    }, [forwardedProps.id]);

    const {
      textValue,
      status,
      onChange: onChangeInner,
      onChangeDirect,
      onChangeHeadless,
      onBlur,
    } = useNumeric({
      initial: value,
      onValidChange: onChange,
      min,
      max,
      enforceLimits: strictText,
    });

    useEffect(() => {
      if (focusState !== FocusState.Focused) {
        onChangeHeadless(value);
      }
    }, [value, focusState, onChangeHeadless]);

    useEffect(() => {
      onStatusChange?.(status);
    }, [status, onStatusChange]);

    useGesture(
      {
        onDrag: ({
          xy: [x],
          movement: [mx],
          first = false,
          last = false,
          intentional,
          tap,
          dragging = false,
          hovering = false,
          wheeling = false,
          event,
          delta: [dx],
        }) => {
          if (disabled) return;
          if (!intentional) return;
          if (tap) return;
          if (focusState === FocusState.Focused || focusState === FocusState.FocusedLabel) return;
          if (!boundsRef.current) return;
          const bounds = boundsRef.current.getBoundingClientRect();
          if (first && focusState !== FocusState.Dragging) {
            setFocusState(FocusState.Dragging);
            dragStartValueRef.current = value;
            lastDragValueRef.current = value;
            onDragStartNative?.(event as MouseEvent, value);
          } else if (last && focusState === FocusState.Dragging) {
            setFocusState(FocusState.Blurred);
            wheelCaptureRef.current = false;
            lastWheelTimeRef.current = null;
            onDragEndNative?.(event as MouseEvent, lastDragValueRef.current);
          }
          let v = dragStartValueRef.current;
          const useAbsoluteRange =
            dragMode === "absolute" && (min !== undefined || visualMin !== undefined);
          if (useAbsoluteRange && min !== undefined && max !== undefined) {
            v = (max - min) * ((x - bounds.left) / bounds.width) + min;
            if (strictSlider) {
              v = clamp(v, min, max);
            }
          } else if (useAbsoluteRange && visualMin !== undefined && visualMax !== undefined) {
            v = (visualMax - visualMin) * ((x - bounds.left) / bounds.width) + visualMin;
          } else if (min !== undefined && max !== undefined) {
            v = dragStartValueRef.current + ((max - min) * mx) / bounds.width;
            if (strictSlider) {
              v = clamp(v, min, max);
            }
          } else if (visualMin !== undefined && visualMax !== undefined) {
            v = dragStartValueRef.current + ((visualMax - visualMin) * mx) / bounds.width;
          } else if (dragMode === "absolute") {
            v = value + dx / 100;
          } else {
            v = dragStartValueRef.current + mx / 100;
          }
          const next = round(v, 2);
          lastDragValueRef.current = next;
          onChangeDirect(next, event as MouseEvent);
          onDragMoveNative?.(event as MouseEvent, next);
          if (last) {
            onBlurExternal?.(event as unknown as React.FocusEvent<HTMLInputElement>);
          }
          onHighlightChange?.(dragging || hovering || wheeling);
          event.preventDefault();
          event.stopPropagation();
        },
        onWheel: ({
          delta: [, dy],
          event,
          dragging = false,
          hovering = false,
          wheeling = false,
        }) => {
          if (disabled) return;
          if (dy === 0) return;
          const scrollArmed =
            focusState === FocusState.Focused || focusState === FocusState.Dragging;
          const now = performance.now();
          const newGesture =
            lastWheelTimeRef.current === null ||
            now - lastWheelTimeRef.current > WHEEL_CAPTURE_TIMEOUT_MS;

          if (newGesture) {
            if (!boundsRef.current) return;
            const bounds = boundsRef.current.getBoundingClientRect();
            wheelCaptureRef.current =
              scrollArmed &&
              event.clientX >= bounds.left &&
              event.clientX <= bounds.right &&
              event.clientY >= bounds.top &&
              event.clientY <= bounds.bottom;
          }
          lastWheelTimeRef.current = now;
          if (!scrollArmed || !wheelCaptureRef.current) return;

          let v = value;
          if (min !== undefined && max !== undefined) {
            const step = (max - min) / 100;
            v = value + step * (dy > 0 ? 1 : -1);
            if (strictSlider) {
              v = clamp(v, min, max);
            }
          } else if (visualMin !== undefined && visualMax !== undefined) {
            const step = (visualMax - visualMin) / 100;
            v = value + step * (dy > 0 ? 1 : -1);
          } else {
            v += dy / 100;
          }
          const next = round(v, 2);
          lastDragValueRef.current = next;
          if (newGesture) {
            onDragStartNative?.(event as MouseEvent, value);
          }
          onChangeDirect(next, event as MouseEvent);
          onDragMoveNative?.(event as MouseEvent, next);
          onDragEndNative?.(event as MouseEvent, next);
          onHighlightChange?.(dragging || hovering || wheeling);
          event.preventDefault();
          event.stopPropagation();
        },
        onHover: ({ hovering = false, dragging = false, wheeling = false }) => {
          if (disabled) return;
          onHighlightChange?.(hovering || dragging || wheeling);
          if (!hovering && !dragging && !wheeling && focusState === FocusState.Dragging) {
            setFocusState(FocusState.Blurred);
          }
        },
      },
      {
        target: boundsRef,
        eventOptions: { passive: false },
        drag: {
          filterTaps: true,
        },
      },
    );

    const percent: number | undefined = useMemo(() => {
      const progressValue = focusState === FocusState.Dragging ? lastDragValueRef.current : value;
      if (min !== undefined && max !== undefined) {
        return (progressValue - min) / (max - min);
      } else if (visualMin !== undefined && visualMax !== undefined) {
        return coerceModuloResult(((progressValue - visualMin) / (visualMax - visualMin)) % 1);
      } else {
        return undefined;
      }
    }, [value, visualMin, visualMax, min, max, focusState]);

    // Auto-override variant for warning states
    const [effectiveColor, effectiveVariant] = useMemo<
      [string | undefined, Variant | undefined]
    >(() => {
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
    const isHighlighted = highlight || focusState !== FocusState.Blurred;

    const labelFallbackColorClass = "text-black/85 dark:text-white/85";
    const valueFallbackColorClass = subtle
      ? "dark:focus:text-white focus:text-black text-neutral-600 dark:text-neutral-400"
      : "text-black dark:text-white";
    const unitsFallbackColorClass = subtle
      ? "text-neutral-600 dark:text-neutral-400"
      : "text-black/85 dark:text-white/85";

    return (
      <label
        ref={boundsRef}
        htmlFor={id}
        data-highlighted={isHighlighted ? "" : undefined}
        aria-disabled={disabled}
        style={
          {
            "--custom-color": effectiveColor,
            "--progress": percent ? `${(percent * 100).toFixed(2).toString()}%` : "0%",
          } as CSSProperties
        }
        className={clsx(
          "responsive touch-none isolate",
          effectiveColor ? "custom-color" : effectiveVariant,
          "py-0 px-0.5 group/input-wrapper select-none",
          label && units && "input-label-field-units-grid",
          label && !units && "input-label-field-grid",
          !label && units && "input-field-units-grid",
          !label && !units && "input-field-grid",
          "sized-height rounded-xs place-items-center",
          bg && "variant-input-gradient-bg",
          outline === "interact" && "variant-responsive-appearing-outline",
          outline === "always" && "variant-responsive-persistent-outline",
          size,
          wrapperClassName,
        )}
      >
        {label && (
          <input
            ref={labelRef}
            value={label}
            onChange={(e) => onLabelChange?.(e.target.value)}
            readOnly={!onLabelChange || focusState === FocusState.Dragging}
            onKeyDown={(e) => {
              if (!disabled && e.key === "Enter") {
                setFocusState(FocusState.Blurred);
                wheelCaptureRef.current = false;
                lastWheelTimeRef.current = null;
                onBlurExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
                labelRef.current?.blur();
              }
            }}
            onBlur={(e) => {
              if (!disabled) {
                setFocusState(FocusState.Blurred);
                wheelCaptureRef.current = false;
                lastWheelTimeRef.current = null;
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
              focusState === FocusState.Dragging && "select-none pointer-events-none",
              focusState !== FocusState.Dragging &&
                "group-has-focus/input-wrapper:bg-neutral-900/20",
              focusState !== FocusState.FocusedLabel ? "cursor-ew-resize" : "cursor-text",
              labelFallbackColorClass,
              "responsive grid-area-label sized-text place-items-center text-left rounded-[1px]",
              "sized-inner-group-item font-mono variant-text-caret-color",
              "focus:outline-none",

              "pointer-events-none select-none group-has-focus/input-wrapper:pointer-events-auto group-has-focus/input-wrapper:select-auto",
              "transition-discrete transition-all delay-75",
              // Show ellipsis when the text gets too long
              "truncate px-1 w-full min-w-0 max-w-full",
            )}
          />
        )}

        <input
          ref={inputRef}
          {...forwardedProps}
          id={id}
          value={textValue}
          readOnly={focusState !== FocusState.Focused}
          onChange={onChangeInner}
          className={clsx(
            "responsive grid-area-input-field w-full min-w-0",
            "focus:outline-hidden",
            "disabled:cursor-not-allowed",
            focusState !== FocusState.Focused ? "cursor-ew-resize" : "cursor-text",
            "sized-text sized-height text-right pl-0.5 pr-1",
            "variant-text-caret-color font-mono",
            focusState === FocusState.Dragging && "select-none pointer-events-none",
            size,
            effectiveColor ? "custom-color" : effectiveVariant,
            valueFallbackColorClass,
            className,
          )}
          style={{
            ...(inputStyle as CSSProperties | undefined),
          }}
          onKeyDown={(e) => {
            if (!disabled && e.key === "Enter") {
              setFocusState(FocusState.Blurred);
              wheelCaptureRef.current = false;
              lastWheelTimeRef.current = null;
              onBlur(e);
              onBlurExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
              defaultInputRef.current?.blur();
            }
          }}
          onBlur={(e) => {
            if (!disabled) {
              setFocusState(FocusState.Blurred);
              wheelCaptureRef.current = false;
              lastWheelTimeRef.current = null;
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
            style={{
              width: `${(units.length + 2).toString()}ch`,
            }}
            className={clsx(
              effectiveVariant,
              size,
              "grid-area-input-units text-right select-none pl-0.5 pr-2",
              "grid place-items-center pointer-events-none sized-text",
              "sized-height font-mono flex-none",
              unitsFallbackColorClass,
            )}
          />
        )}
      </label>
    );
  },
);

InnerSliderNumberField.displayName = "SliderNumberField";

export const SliderNumberField = memo(InnerSliderNumberField);
