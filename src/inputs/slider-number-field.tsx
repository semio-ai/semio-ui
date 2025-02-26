import {
  memo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
  forwardRef,
  ForwardedRef,
  FocusEventHandler,
} from "react";
import { animated, useSpringValue, type SpringValue } from "@react-spring/web";
import { round, enableBoundaryChecking } from "number-precision";
import { clamp } from "lodash";
import { alpha } from "@semio/utils";
import { clsx } from "clsx";
import { useGesture } from "@use-gesture/react";
import { useNumeric } from "../hooks/use-numeric";
import { Size } from "../types";
import { getHeight, getFontSize } from "../style-functions";
import { StyledInput } from "./styled-input";

enableBoundaryChecking(false);

interface InputProps {
  percent: SpringValue<number>;
  color: string;
  size: Size;
  focused?: boolean;
  inactive?: boolean;
  showFill?: boolean;
  emphasis?: boolean;
}

enum SliderMode {
  Drag,
  Manual,
  Blurred,
  Label,
}

const InputWrapper = forwardRef(
  (props: InputProps & HTMLAttributes<HTMLDivElement>, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      size,
      color,
      percent,
      inactive,
      children,
      focused,
      showFill,
      emphasis,
      ...forwardedProps
    } = props;

    return (
      <animated.div
        ref={ref}
        {...forwardedProps}
        className={clsx(
          "flex flex-row w-full touch-none p-0 overflow-hidden rounded-none items-baseline",
          getHeight(size),
          "outline outline-1 outline-offset-2 transition-[outline-color,background]",
        )}
        // Tailwind does not support truly dynamic styles, so we have to use inline styles here
        style={{
          outlineColor: alpha(color, focused ? 1 : 0),
          background: !showFill
            ? alpha(color, emphasis ? 0.5 : 0.35)
            : percent.to(
                (p) =>
                  `linear-gradient(90deg, ${alpha(color, inactive ? 0.6 : 1)} 0%, ${alpha(color, inactive ? 0.6 : 1)} ${(p * 100).toString()}%, ${alpha(color, emphasis ? 0.35 : 0.2)} ${(p * 100).toString()}%, ${alpha(color, emphasis ? 0.35 : 0.2)} 100%)`,
              ),
        }}
      >
        {children}
      </animated.div>
    );
  },
);

InputWrapper.displayName = "InputWrapper";

export interface SliderNumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  visualMin?: number;
  visualMax?: number;
  units?: string;
  color?: string;
  strictSlider?: boolean;
  strictText?: boolean;
  emphasis?: boolean;
  size?: Size;
  inactive?: boolean;
  disabled?: boolean;
  label?: string;
  onLabelChange?: (label: string) => void;
  onEmphasisChange?: (emphasis: boolean) => void;
  onFocus?: FocusEventHandler;
  onBlur?: FocusEventHandler;
}

/**
 * SliderNumberField
 * @param {number} value:  - the value of the field
 * @param onChange: (value: number) => void - the function to call when the value changes
 * @param min?: number - the minimum value
 * @param max?: number - the maximum value
 * @param visualMin?: number - the minimum visual value
 * @param visualMax?: number - the maximum visual value
 * @param units?: string - the units to display
 * @param color?: string - the color of the slider
 * @param strictSlider?: boolean - whether to enforce the slider bounds
 * @param strictText?: boolean - whether to enforce the text bounds
 * @param emphasis?: boolean - whether the field is emphasized
 * @param size?: Size - the size of the field
 * @param inactive?: boolean - whether the field is inactive
 * @param disabled?: boolean - whether the field is disabled
 * @param label?: string - the label of the field
 * @param onLabelChange?: (label: string) => void - the function to call when the label changes
 * @param onEmphasisChange?: (emphasis: boolean) => void - the function to call when the emphasis changes
 * @param onFocus?: FocusEventHandler;
 * @param onBlur?: FocusEventHandler;
 */
function InnerSliderNumberField({
  value,
  onChange,
  min,
  max,
  visualMin,
  visualMax,
  units,
  color,
  strictText = false,
  strictSlider = false,
  emphasis,
  size = Size.Md,
  inactive,
  disabled,
  label,
  onLabelChange,
  onEmphasisChange,
  onBlur: onBlurExternal,
  onFocus: onFocusExternal,
}: SliderNumberFieldProps): ReactNode {
  const boundsRef = useRef<HTMLDivElement>(null);
  const sliderColor = color || "#737373";

  const [sliderMode, setSliderMode] = useState(SliderMode.Blurred);

  const percentSpring = useSpringValue<number>(value);

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
    if (sliderMode !== SliderMode.Manual) {
      onChangeHeadless(value);
    }
  }, [value, sliderMode, onChangeHeadless]);

  useEffect(() => {
    if (min !== undefined && max !== undefined) {
      percentSpring.set((value - min) / (max - min));
    } else if (visualMin !== undefined && visualMax !== undefined) {
      percentSpring.set(coerceModuloResult(((value - visualMin) / (visualMax - visualMin)) % 1));
    }
  }, [value, min, max, percentSpring, visualMin, visualMax]);

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
        if (sliderMode === SliderMode.Manual || sliderMode === SliderMode.Label) return;
        if (!boundsRef.current) return;
        const bounds = boundsRef.current.getBoundingClientRect();
        if ((wheeling || dragging) && sliderMode !== SliderMode.Drag) {
          setSliderMode(SliderMode.Drag);
        } else if (!wheeling && !dragging && sliderMode === SliderMode.Drag) {
          setSliderMode(SliderMode.Blurred);
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
        onChangeDirect(round(v, 2));
        if (!dragging && !wheeling) {
          onBlurExternal?.(event as unknown as React.FocusEvent<HTMLInputElement>);
        }
        onEmphasisChange?.(dragging || hovering || wheeling);
        event.preventDefault();
        event.stopPropagation();
      },
      onWheel: ({ delta: [, dy], event, dragging = false, hovering = false, wheeling = false }) => {
        if (disabled) return;
        if (sliderMode === SliderMode.Blurred) return;
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
        onChangeDirect(round(v, 2));
        onEmphasisChange?.(dragging || hovering || wheeling);
        if ((wheeling || dragging) && sliderMode !== SliderMode.Drag) {
          setSliderMode(SliderMode.Drag);
        } else if (!wheeling && !dragging && sliderMode === SliderMode.Drag) {
          setSliderMode(SliderMode.Blurred);
        }
        if (!dragging && !wheeling) {
          onBlurExternal?.(event as unknown as React.FocusEvent<HTMLInputElement>);
        }
        event.preventDefault();
        event.stopPropagation();
      },
      onHover: ({ hovering = false, dragging = false, wheeling = false }) => {
        if (disabled) return;
        onEmphasisChange?.(hovering || dragging || wheeling);
        if (!hovering && !dragging && !wheeling && sliderMode === SliderMode.Drag) {
          setSliderMode(SliderMode.Blurred);
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

  return (
    <InputWrapper
      ref={boundsRef}
      color={sliderColor}
      size={size}
      showFill={
        (min !== undefined && max !== undefined) ||
        (visualMin !== undefined && visualMax !== undefined)
      }
      inactive={inactive || disabled}
      percent={percentSpring}
      focused={sliderMode !== SliderMode.Blurred}
      emphasis={sliderMode !== SliderMode.Blurred || emphasis}
      onBlur={(event) => {
        if (disabled) return;
        setSliderMode(SliderMode.Blurred);
        onBlur();
        event.stopPropagation();
      }}
    >
      {label !== undefined && (
        <input
          readOnly={!onLabelChange || inactive || sliderMode !== SliderMode.Label}
          onChange={(e) => onLabelChange?.(e.target.value || "")}
          className={clsx(
            "flex-1 bg-transparent dark:text-white/75 text-black/75 text-left pl-1 outline-none overflow-ellipsis max-w-[60%] touch-none",
            sliderMode === SliderMode.Label
              ? "cursor-text select-none font-bold"
              : "cursor-ew-resize select-none font-normal selection:bg-transparent",
            getFontSize(size),
          )}
          value={label}
          onDoubleClick={() => {
            if (disabled) return;
            setSliderMode(SliderMode.Label);
          }}
          onBlur={() => {
            setSliderMode(SliderMode.Blurred);
          }}
        />
      )}

      <StyledInput
        flex
        readOnly={inactive || (sliderMode !== SliderMode.Manual && sliderMode !== SliderMode.Label)}
        disabled={disabled}
        type="text"
        color={sliderColor}
        bold={sliderMode === SliderMode.Manual}
        cursor={sliderMode === SliderMode.Manual ? "cursor-text" : "cursor-ew-resize"}
        className="text-right flex-1 font-mono"
        size={size}
        value={textValue}
        onChange={onChangeInner}
        onKeyDown={(e) => {
          if (!disabled && e.key === "Enter") {
            setSliderMode(SliderMode.Blurred);
            onBlur();
            onBlurExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            setSliderMode(SliderMode.Blurred);
            onBlur();
            onBlurExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
          }
        }}
        onDoubleClick={(e) => {
          if (disabled) return;
          setSliderMode(SliderMode.Manual);
          onFocusExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
        }}
      />
      <span className={clsx("w-fit font-mono pr-1 text-black dark:text-white", getFontSize(size))}>
        {units}
      </span>
    </InputWrapper>
  );
}

export const SliderNumberField = memo(InnerSliderNumberField);

const coerceModuloResult = (num: number) => (num < 0 ? num + 1 : num);
