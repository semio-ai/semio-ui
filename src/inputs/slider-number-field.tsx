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
import { Size } from "../types";
import { NumberFieldProps } from "./number-field";

enableBoundaryChecking(false);

const coerceModuloResult = (num: number) => (num < 0 ? num + 1 : num);

enum FocusState {
  Focused, // The main input is focused
  Blurred, // Nothing is focused
  FocusedLabel, // The label is focused
  Dragging, // The slider is being dragged
}

export interface SliderNumberFieldProps extends Omit<NumberFieldProps, "strict"> {
  visualMin?: number;
  visualMax?: number;
  strictSlider?: boolean;
  strictText?: boolean;
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
      ...forwardedProps
    }: SliderNumberFieldProps,
    ref: ForwardedRef<HTMLInputElement>,
  ): ReactNode => {
    const boundsRef = useRef<HTMLLabelElement>(null);
    const labelRef = useRef<HTMLInputElement>(null);
    const defaultInputRef = useRef<HTMLInputElement>(null);

    const inputRef = mergeRefs<HTMLInputElement>([defaultInputRef, ref]);

    const [focusState, setFocusState] = useState(FocusState.Blurred);

    const id = useMemo(() => {
      return forwardedProps.id ?? crypto.randomUUID();
    }, [forwardedProps.id]);

    const {
      textValue,
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

    useGesture(
      {
        onDrag: ({
          xy: [x],
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
          if ((wheeling || dragging) && focusState !== FocusState.Dragging) {
            setFocusState(FocusState.Dragging);
          } else if (!wheeling && !dragging && focusState === FocusState.Dragging) {
            setFocusState(FocusState.Blurred);
          }
          let v = value;
          if (min !== undefined && max !== undefined) {
            v = (max - min) * ((x - bounds.left) / bounds.width) + min;
            if (strictSlider) {
              v = clamp(v, min, max);
            }
          } else if (visualMin !== undefined && visualMax !== undefined) {
            v = (visualMax - visualMin) * ((x - bounds.left) / bounds.width) + visualMin;
          } else {
            v += dx / 100;
          }
          onChangeDirect(round(v, 2), event as MouseEvent);
          if (!dragging && !wheeling) {
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
          if (focusState === FocusState.Blurred) return;
          if (dy === 0) return;
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
          onChangeDirect(round(v, 2), event as MouseEvent);
          onHighlightChange?.(dragging || hovering || wheeling);
          if ((wheeling || dragging) && focusState !== FocusState.Dragging) {
            setFocusState(FocusState.Dragging);
          } else if (!wheeling && !dragging && focusState === FocusState.Dragging) {
            setFocusState(FocusState.Blurred);
          }
          if (!dragging && !wheeling) {
            onBlurExternal?.(event as unknown as React.FocusEvent<HTMLInputElement>);
          }
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
      if (min !== undefined && max !== undefined) {
        return (value - min) / (max - min);
      } else if (visualMin !== undefined && visualMax !== undefined) {
        return coerceModuloResult(((value - visualMin) / (visualMax - visualMin)) % 1);
      } else {
        return undefined;
      }
    }, [value, visualMin, visualMax, min, max]);

    return (
      <label
        ref={boundsRef}
        htmlFor={id}
        data-highlighted={highlight || focusState !== FocusState.Blurred ? "" : undefined}
        style={
          {
            "--custom-color": color,
            "--progress": percent ? `${(percent * 100).toFixed(2).toString()}%` : "0%",
          } as CSSProperties
        }
        className={clsx(
          "responsive",
          color ? "custom-color" : variant,
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
              color ? "custom-color" : variant,
              size,
              focusState === FocusState.Dragging && "select-none pointer-events-none",
              focusState !== FocusState.Dragging &&
                "group-has-focus/input-wrapper:bg-neutral-900/20",
              focusState !== FocusState.FocusedLabel ? "cursor-ew-resize" : "cursor-text",
              "responsive grid-area-label sized-text place-items-center text-center rounded-[1px]",
              "sized-inner-group-item font-mono variant-text-caret-color",
              "text-white/50 focus:outline-none focus:text-white/75 dark:focus:text-white/75",
              "pointer-events-none select-none group-has-focus/input-wrapper:pointer-events-auto group-has-focus/input-wrapper:select-auto",
              "transition-discrete transition-all delay-75",
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
          readOnly={focusState !== FocusState.Focused}
          onChange={onChangeInner}
          className={clsx(
            "responsive grid-area-field w-full min-w-0",
            "focus:outline-hidden",
            "disabled:cursor-not-allowed",
            focusState !== FocusState.Focused ? "cursor-ew-resize" : "cursor-text",
            "sized-text sized-height text-right px-0.5",
            "variant-text-caret-color font-mono",
            focusState === FocusState.Dragging && "select-none pointer-events-none",
            size,
            color ? "custom-color" : variant,
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
              defaultInputRef.current?.blur();
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
              variant,
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

InnerSliderNumberField.displayName = "SliderNumberField";

export const SliderNumberField = memo(InnerSliderNumberField);
