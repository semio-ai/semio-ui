import {
  memo,
  useRef,
  useState,
  type ReactNode,
  type InputHTMLAttributes,
  type HTMLAttributes,
  forwardRef,
  ForwardedRef,
} from "react";
import { round, enableBoundaryChecking } from "number-precision";
import { clsx } from "clsx";
import { useGesture } from "@use-gesture/react";
import { useNumeric } from "../hooks/use-numeric";
import { alpha } from "@semio/utils";

enableBoundaryChecking(false);

interface AdditionalProps {
  percent?: number;
  color: string;
  sliderMode: SliderMode;
  sizeVariant: keyof typeof heightLookup;
  focused?: boolean;
  inactive?: boolean;
}

enum SliderMode {
  DRAG,
  MANUAL,
  BLURRED,
}

const heightLookup = {
  sm: "h-7",
  md: "h-8",
  lg: "h-10",
};

const fontSizeLookup = {
  sm: "text-xs",
  md: "text-base",
  lg: "text-xl",
};

const StyledInput = (
  props: AdditionalProps & InputHTMLAttributes<HTMLInputElement>,
) => {
  const { sliderMode, sizeVariant, disabled, color, ...forwardedProps } = props;
  return (
    <input
      {...forwardedProps}
      type="text"
      className={clsx(
        "w-full touch-none font-mono text-right outline-none bg-transparent pt-0 pb-0 pl-3 pr-3",
        "dark:text-white text-black",
        sliderMode === SliderMode.MANUAL
          ? "select-text font-bold"
          : "select-none font-normal",
        sizeVariant ? heightLookup[sizeVariant] : heightLookup.md,
        sizeVariant ? fontSizeLookup[sizeVariant] : fontSizeLookup.md,
        getCursor(disabled || false, sliderMode),
      )}
    />
  );
};

const InputWrapper = forwardRef(
  (
    props: AdditionalProps & HTMLAttributes<HTMLDivElement>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const {
      sizeVariant,
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
          "w-full touch-none p-0 overflow-hidden rounded-none transition-all",
          sizeVariant ? heightLookup[sizeVariant] : heightLookup.md,
          `outline outline-1 outline-offset-2`,
        )}
        // Tailwind does not support truly dynamic styles, so we have to use inline styles here
        style={{
          outlineColor: alpha(color, focused ? 1 : 0),
          background: `linear-gradient(90deg, ${alpha(color, inactive ? 0.6 : 1)} 0%, ${alpha(color, inactive ? 0.6 : 1)} ${(percent || 0) * 100}%, ${alpha(color, focused ? 0.25 : 0.15)} ${(percent || 0) * 100}%, ${alpha(color, focused ? 0.25 : 0.15)} 100%)`,
        }}
      >
        {children}
      </div>
    );
  },
);

export interface SliderNumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  units?: string;
  color?: string;
  strict?: boolean;
  size?: "sm" | "md" | "lg";
  inactive?: boolean;
  disabled?: boolean;
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
  size = "md",
  inactive,
  disabled,
}: SliderNumberFieldProps): ReactNode {
  // const theme = useMantineTheme();
  const [dragging, setDragging] = useState(false);

  const boundsRef = useRef<HTMLDivElement>(null);
  const sliderColor = color || "#737373";

  const [sliderMode, setSliderMode] = useState(SliderMode.BLURRED);

  const {
    textValue,
    onChange: onChangeInner,
    onChangeDirect,
    onBlur,
  } = useNumeric({
    initial: value,
    onValidChange: onChange,
    min,
    max,
  });

  const bindings = useGesture(
    {
      onDrag: ({ xy: [x], down, intentional, tap }) => {
        if (disabled) return;
        if (!intentional) return;
        if (tap) return;
        if (sliderMode === SliderMode.MANUAL) return;
        if (!boundsRef.current) return;
        const bounds = boundsRef.current.getBoundingClientRect();
        setSliderMode(SliderMode.DRAG);
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
      onDoubleClick: () => {
        if (disabled) return;
        setSliderMode(SliderMode.MANUAL);
      },
      onBlur: ({ event }) => {
        if (disabled) return;
        setSliderMode(SliderMode.BLURRED);
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
      sliderMode={sliderMode}
      sizeVariant={size}
      inactive={inactive || disabled}
      percent={(value - min) / (max - min)}
      focused={sliderMode !== SliderMode.BLURRED || dragging}
    >
      <StyledInput
        readOnly={inactive || sliderMode !== SliderMode.MANUAL}
        inactive={inactive || disabled}
        disabled={disabled}
        type="text"
        color={sliderColor}
        sliderMode={sliderMode}
        sizeVariant={size}
        value={textValue}
        onChange={onChangeInner}
        onKeyDown={(e) => {
          if (!disabled && e.key === "Enter") {
            setSliderMode(SliderMode.BLURRED);
            onBlur();
          }
        }}
      />
      <span>{units}</span>
    </InputWrapper>
  );
}

const getCursor = (disabled: boolean, sliderMode: SliderMode) => {
  if (disabled) return "cursor-not-allowed";
  if (sliderMode === SliderMode.MANUAL) return "cursor-text";
  return "cursor-ew-resize";
};

export const SliderNumberField = memo(InnerSliderNumberField);
