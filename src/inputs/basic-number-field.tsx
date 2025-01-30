import { memo, useEffect, type ReactNode, type InputHTMLAttributes } from "react";
import { enableBoundaryChecking } from "number-precision";
import { clsx } from "clsx";
import { useNumeric } from "../hooks/use-numeric";
import { Size, Variant } from "../types";
import { getHeight, getFontSize, getOutline, getTextCaretColor } from "../style-functions";
import { StyledInput } from "./styled-input";

enableBoundaryChecking(false);

export interface BasicNumberFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  onChange?: (value: number) => void;
  value: number;
  min?: number;
  max?: number;
  units?: string;
  variant?: Variant;
  size?: Size;
  bg?: boolean;
  outline?: boolean;
  subtle?: boolean;
}

function InnerBasicNumberField({
  value,
  onChange,
  min,
  max,
  units,
  size = Size.Md,
  variant = Variant.Default,
  bg = false,
  outline = true,
  subtle,
  className,
  ...forwardedProps
}: BasicNumberFieldProps): ReactNode {
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
    enforceLimits: min !== undefined && max !== undefined,
  });

  useEffect(() => {
    onChangeHeadless(value);
  }, [value, onChangeHeadless]);

  return (
    <div
      className={clsx(
        bg && "dark:bg-neutral-950/20 bg-neutral-50/20",
        "flex flex-row w-full items-center gap-1",
        outline && "focus-within:outline focus-within:outline-1 focus-within:outline-offset-2",
        getOutline(variant),
        getHeight(size),
        getTextCaretColor(variant),
      )}
    >
      <StyledInput
        {...forwardedProps}
        value={textValue}
        onBlur={(e) => {
          if (!forwardedProps.disabled && !forwardedProps.readOnly) onBlur();
          forwardedProps.onBlur?.(e);
        }}
        cursor="cursor-text"
        subtle={subtle}
        className={clsx(
          "flex-1 text-right focus:placeholder-transparent disabled:text-opacity-30",
          className,
        )}
        size={size}
        onChange={onChangeInner}
      />
      <span
        className={clsx(
          "w-fit font-mono pr-1",
          forwardedProps.disabled
            ? "text-black/25 dark:text-white/25"
            : "text-black/50 dark:text-white/50",
          getFontSize(size),
        )}
      >
        {units}
      </span>
    </div>
  );
}

export const BasicNumberField = memo(InnerBasicNumberField);
