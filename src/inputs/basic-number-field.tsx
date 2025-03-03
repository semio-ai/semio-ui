import {
  memo,
  useState,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
  forwardRef,
  ForwardedRef,
  FocusEventHandler,
} from "react";
import { animated, useSpringValue, type SpringValue } from "@react-spring/web";
import { enableBoundaryChecking } from "number-precision";
import { alpha } from "@semio/utils";
import { clsx } from "clsx";
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

enum FocusState {
  Focused,
  Blurred,
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

export interface BasicNumberFieldProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  units?: string;
  color?: string;
  strict?: boolean;
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
 * BasicNumberField
 * @param {string} id - the id of the field
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
function InnerBasicNumberField({
  value,
  onChange,
  min,
  max,
  units,
  color,
  strict = false,
  emphasis,
  size = Size.Md,
  inactive,
  disabled,
  onEmphasisChange,
  onBlur: onBlurExternal,
  onFocus: onFocusExternal,
}: BasicNumberFieldProps): ReactNode {
  const sliderColor = color || "#737373";

  const [focusState, setFocusState] = useState(FocusState.Blurred);

  const percentSpring = useSpringValue<number>(value);

  const {
    textValue,
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

  return (
    <InputWrapper
      color={sliderColor}
      size={size}
      showFill={false}
      inactive={inactive || disabled}
      percent={percentSpring}
      focused={focusState !== FocusState.Blurred}
      emphasis={focusState !== FocusState.Blurred || emphasis}
      onBlur={(event) => {
        if (disabled) return;
        setFocusState(FocusState.Blurred);
        onBlur();
        event.stopPropagation();
      }}
      onMouseOver={() => {
        if (disabled) return;
        onEmphasisChange?.(true);
      }}
      onMouseLeave={() => {
        if (disabled) return;
        onEmphasisChange?.(false);
      }}
    >
      <StyledInput
        flex
        readOnly={inactive || focusState === FocusState.Blurred}
        disabled={disabled}
        type="text"
        color={sliderColor}
        bold={focusState === FocusState.Focused}
        cursor="cursor-text"
        className="text-right flex-1 font-mono"
        size={size}
        value={textValue}
        onChange={onChangeInner}
        onKeyDown={(e) => {
          if (!disabled && e.key === "Enter") {
            setFocusState(FocusState.Blurred);
            onBlur();
            onBlurExternal?.(e as unknown as React.FocusEvent<HTMLInputElement>);
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            setFocusState(FocusState.Blurred);
            onBlur();
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
      <span className={clsx("w-fit font-mono pr-1 text-black dark:text-white", getFontSize(size))}>
        {units}
      </span>
    </InputWrapper>
  );
}

export const BasicNumberField = memo(InnerBasicNumberField);
