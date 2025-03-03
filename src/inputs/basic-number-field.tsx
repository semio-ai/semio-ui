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
import { enableBoundaryChecking } from "number-precision";
import { alpha } from "@semio/utils";
import { useHover } from "@use-gesture/react";
import { clsx } from "clsx";
import { useNumeric } from "../hooks/use-numeric";
import { Size } from "../types";
import { getHeight, getFontSize } from "../style-functions";
import { StyledInput } from "./styled-input";

enableBoundaryChecking(false);

interface InputProps {
  color: string;
  size: Size;
  focused?: boolean;
  inactive?: boolean;
  emphasis?: boolean;
}

enum FocusState {
  Focused,
  Blurred,
}

const InputWrapper = forwardRef(
  (props: InputProps & HTMLAttributes<HTMLDivElement>, ref: ForwardedRef<HTMLDivElement>) => {
    const { size, color, inactive, children, focused, emphasis, ...forwardedProps } = props;

    const activityOpacity = inactive ? 0.25 : 0.35;
    const opacity = emphasis || focused ? 0.5 : activityOpacity;

    return (
      <div
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
          background: alpha(color, opacity),
        }}
      >
        {children}
      </div>
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
  const inputColor = color || "#737373";

  const [focusState, setFocusState] = useState(FocusState.Blurred);

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

  const bind = useHover((state) => {
    if (state.hovering) {
      onEmphasisChange?.(true);
    } else {
      onEmphasisChange?.(false);
    }
  });

  return (
    <InputWrapper
      {...bind}
      color={inputColor}
      size={size}
      inactive={inactive || disabled}
      focused={focusState !== FocusState.Blurred}
      emphasis={focusState !== FocusState.Blurred || emphasis}
      onBlur={(event) => {
        if (disabled) return;
        setFocusState(FocusState.Blurred);
        onBlur();
        event.stopPropagation();
      }}
    >
      <StyledInput
        flex
        readOnly={inactive || focusState === FocusState.Blurred}
        disabled={disabled}
        type="text"
        color={inputColor}
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
