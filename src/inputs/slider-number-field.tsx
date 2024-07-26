import {
  memo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
  forwardRef,
  ForwardedRef,
} from "react";
import { round, enableBoundaryChecking } from "number-precision";
import { alpha } from "@semio/utils";
import { clsx } from "clsx";
import { useGesture } from "@use-gesture/react";
import { useNumeric } from "../hooks/use-numeric";
import { Size } from "../types";
import { getHeight, getFontSize } from "../style-functions";
import { StyledInput } from "./styled-input";

enableBoundaryChecking(false);

interface InputProps {
  percent?: number;
  color: string;
  size: Size;
  focused?: boolean;
  inactive?: boolean;
}

enum SliderMode {
  Drag,
  Manual,
  Blurred,
  Label,
}

const InputWrapper = forwardRef(
  (
    props: InputProps & HTMLAttributes<HTMLDivElement>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const {
      size,
      color,
      percent,
      inactive,
      children,
      focused,
      ...forwardedProps
    } = props;
    return (
      <div
        ref={ref}
        {...forwardedProps}
        className={clsx(
          "flex flex-row w-full touch-none p-0 overflow-hidden rounded-none transition-all",
          getHeight(size),
          "outline outline-1 outline-offset-2",
        )}
        // Tailwind does not support truly dynamic styles, so we have to use inline styles here
        style={{
          outlineColor: alpha(color, focused ? 1 : 0),
          background: `linear-gradient(90deg, ${alpha(color, inactive ? 0.6 : 1)} 0%, ${alpha(color, inactive ? 0.6 : 1)} ${((percent || 0) * 100).toString()}%, ${alpha(color, focused ? 0.25 : 0.15)} ${((percent || 0) * 100).toString()}%, ${alpha(color, focused ? 0.25 : 0.15)} 100%)`,
        }}
      >
        {children}
      </div>
    );
  },
);

InputWrapper.displayName = "InputWrapper";

export interface SliderNumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  units?: string;
  color?: string;
  strict?: boolean;
  size?: Size;
  inactive?: boolean;
  disabled?: boolean;
  label?: string;
  onLabelChange?: (label: string) => void;
}

/*
SliderNumberField
@props value: number - the value of the field
@props onChange: (value: number) => void - the callback to call when the value changes
@props min: number - the minimum value of the field
@props max: number - the maximum value of the field
@props color?: string - the color of the field (defaults to gray. Can be any string in hex, rgb, or hsl format)
@props strict?: boolean - whether to enforce the min and max values
@props size?: "sm" | "md" | "lg" - the size of the field
@props inactive?: boolean - whether the field is inactive (still allows clicking)
@props disabled?: boolean - whether the field is disabled (does not allow clicking or changing the value)
*/
function InnerSliderNumberField({
  value,
  onChange,
  min,
  max,
  units,
  color,
  strict,
  size = Size.Md,
  inactive,
  disabled,
  label,
  onLabelChange,
}: SliderNumberFieldProps): ReactNode {
  // const theme = useMantineTheme();
  const [dragging, setDragging] = useState(false);

  const boundsRef = useRef<HTMLDivElement>(null);
  const sliderColor = color || "#737373";

  const [sliderMode, setSliderMode] = useState(SliderMode.Blurred);

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
  });

  useEffect(() => {
    if (sliderMode !== SliderMode.Manual) {
      onChangeHeadless(value);
    }
  }, [value, sliderMode, onChangeHeadless]);

  const bindings = useGesture(
    {
      onDrag: ({ xy: [x], down, intentional, tap }) => {
        if (disabled) return;
        if (!intentional) return;
        if (tap) return;
        if (sliderMode === SliderMode.Manual || sliderMode === SliderMode.Label)
          return;
        if (!boundsRef.current) return;
        const bounds = boundsRef.current.getBoundingClientRect();
        setSliderMode(SliderMode.Drag);
        let v = (max - min) * ((x - bounds.left) / bounds.width) + min;
        // console.log("v", v);
        if (strict) {
          v = Math.max(min, Math.min(max, v));
        }
        // animatedValue.set(v);
        onChangeDirect(round(v, 2));
        setDragging(down);
      },
      onDragEnd: () => {
        if (disabled) return;
        // animatedValue.set(value);
        setDragging(false);
      },
      onBlur: ({ event }) => {
        if (disabled) return;
        setSliderMode(SliderMode.Blurred);
        onBlur();
        event.stopPropagation();
      },
    },
    {
      drag: {
        // bounds,
        filterTaps: true,
        // from: [bounds.left + bounds.width * ((value - min) / (max - min)), 0],
      },
    },
  );

  return (
    <InputWrapper
      ref={boundsRef}
      {...bindings()}
      color={sliderColor}
      size={size}
      inactive={inactive || disabled}
      percent={(value - min) / (max - min)}
      focused={sliderMode !== SliderMode.Blurred || dragging}
    >
      {label !== undefined && (
        <input
          readOnly={
            !onLabelChange || inactive || sliderMode !== SliderMode.Label
          }
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
        readOnly={
          inactive ||
          (sliderMode !== SliderMode.Manual && sliderMode !== SliderMode.Label)
        }
        disabled={disabled}
        type="text"
        color={sliderColor}
        bold={sliderMode === SliderMode.Manual}
        cursor={
          sliderMode === SliderMode.Manual ? "cursor-text" : "cursor-ew-resize"
        }
        className="text-right flex-1"
        size={size}
        value={textValue}
        onChange={onChangeInner}
        onKeyDown={(e) => {
          if (!disabled && e.key === "Enter") {
            setSliderMode(SliderMode.Blurred);
            onBlur();
          }
        }}
        onDoubleClick={() => {
          if (disabled) return;
          setSliderMode(SliderMode.Manual);
        }}
      />
      <span className={clsx("w-fit font-mono pr-1", getFontSize(size))}>
        {units}
      </span>
    </InputWrapper>
  );
}

export const SliderNumberField = memo(InnerSliderNumberField);
