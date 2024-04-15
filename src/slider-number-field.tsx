import styled from "@emotion/styled";
import { useMantineTheme, getThemeColor, lighten, alpha } from "@mantine/core";
import { memo, useMemo, useRef, useState, type ReactNode } from "react";
import { round, enableBoundaryChecking } from "number-precision";
import { useGesture } from "@use-gesture/react";
// import { IMaskMixin } from "react-imask";
import { useNumeric } from "./use-numeric";

enableBoundaryChecking(false);

interface AdditionalProps {
  percent?: number;
  color: string;
  sliderMode: SliderMode;
  sizeVariant: "sm" | "md" | "lg";
  focused?: boolean;
  inactive?: boolean;
}

const InnerInput = styled("input", {
  // touchAction: 'none',
  // width: 100%,
  shouldForwardProp: (prop) =>
    ![
      "sizeVariant",
      "percent",
      "color",
      "sliderMode",
      "focused",
      "inactive",
    ].includes(prop),
})<AdditionalProps>(
  {
    width: "100%",
    touchAction: "none",
    fontFamily: "monospace",
    textAlign: "right",
    outline: "none",
    background: "transparent",
    padding: "0px 12px 0px 12px",
    color: "var(--mantine-font-color)",
  },
  ({ sizeVariant, color, sliderMode, disabled }) => ({
    userSelect: sliderMode === SliderMode.MANUAL ? "text" : "none",
    height: sizeVariant ? heightLookup[sizeVariant] : heightLookup.md,
    fontSize: sizeVariant ? fontSizeLookup[sizeVariant] : fontSizeLookup.md,
    fontWeight: sliderMode === SliderMode.MANUAL ? "bold" : "normal",
    cursor: getCursor(disabled || false, sliderMode),
    caretColor:
      sliderMode === SliderMode.MANUAL ? lighten(color, 0.4) : "transparent",
    // textDecoration: sliderMode === SliderMode.MANUAL ? "underline" : "none",
    "&::selection": {
      backgroundColor:
        sliderMode === SliderMode.MANUAL ? lighten(color, 0.2) : "transparent",
    },
  }),
);

const InputWrapper = styled("div", {
  // touchAction: 'none',
  // width: 100%,
  shouldForwardProp: (prop) =>
    ![
      "sizeVariant",
      "percent",
      "color",
      "sliderMode",
      "focused",
      "inactive",
    ].includes(prop),
})<AdditionalProps>(
  {
    touchAction: "none",
    padding: 0,
    overflow: "hidden",
    borderRadius: 0,
    transition: "0.3s",
    // backgroundColor: "red",
  },
  ({ sizeVariant, percent = 0, color, focused, inactive }) => ({
    height: sizeVariant ? heightLookup[sizeVariant] : heightLookup.md,
    boxShadow: `inset 0 0 0 1px ${focused ? color : "var(--mantine-color-body)"}`,
    background: `linear-gradient(90deg, ${alpha(color, inactive ? 0.6 : 1)} 0%, ${alpha(color, inactive ? 0.6 : 1)} ${
      percent * 100
    }%, ${alpha(color, focused ? 0.25 : 0.15)} ${percent * 100}%, ${alpha(color, focused ? 0.25 : 0.15)} 100%)`,
    "&:focus": {
      boxShadow: `1px solid ${color}`,
    },
  }),
);

const heightLookup = {
  sm: "24px",
  md: "30px",
  lg: "40px",
};

const fontSizeLookup = {
  sm: "10px",
  md: "16px",
  lg: "20px",
};

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

enum SliderMode {
  DRAG,
  MANUAL,
  BLURRED,
}

/*
SliderNumberField
@props value: number - the value of the field
@props onChange: (value: number) => void - the callback to call when the value changes
@props min: number - the minimum value of the field
@props max: number - the maximum value of the field
@props color?: string - the color of the field
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
  const theme = useMantineTheme();
  const [active, setActive] = useState(false);

  const boundsRef = useRef<HTMLDivElement>(null);

  const sliderColor = useMemo(() => {
    if (color) {
      if (active) {
        return lighten(color, 0.1);
      } else return color;
    }
    return getThemeColor(active ? "gray.5" : "gray.7", theme);
  }, [active, color, theme]);

  // const [ref, bounds] = useMeasure();

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
        setActive(down);
      },
      onDragEnd: () => {
        if (disabled) return;
        // animatedValue.set(value);
        setActive(false);
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
      focused={sliderMode !== SliderMode.BLURRED}
    >
      <InnerInput
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
  if (disabled) return "not-allowed";
  if (sliderMode === SliderMode.MANUAL) return "text";
  return "ew-resize";
};

export const SliderNumberField = memo(InnerSliderNumberField);
