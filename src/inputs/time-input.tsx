import { useState, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { Size, TimeDisplay, Variant } from "../types";
import { useTemporal } from "../hooks/use-temporal";
import { useNumeric } from "../hooks/use-numeric";
import { StyledInput } from "./styled-input";
import { TextField } from "./text-field";

export interface TimeInputProps extends Omit<React.HTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number | undefined;
  onChange: (value: number) => void;
  framerate: number;
  display?: TimeDisplay;
  disabled?: boolean;
  min?: number;
  max?: number;
  variant: Variant;
  size?: Size;
  bg?: boolean;
  label?: string;
  hidden?: boolean;
}

function getWidth(length: number, size: Size): string {
  if (length === 2) {
    if (size === Size.Xs) return "w-6";
    if (size === Size.Sm) return "w-7";
    if (size === Size.Md) return "w-8";
    if (size === Size.Lg) return "w-10";
  }
  if (length === 3) {
    if (size === Size.Xs) return "w-8";
    if (size === Size.Sm) return "w-8";
    if (size === Size.Md) return "w-10";
    if (size === Size.Lg) return "w-12";
  }
  if (size === Size.Xs) return "w-[55px]";
  if (size === Size.Sm) return "w-[60px]";
  if (size === Size.Md) return "w-[80px]";
  if (size === Size.Lg) return "w-[100px]";
  return "";
}

export function TimeInput({
  value,
  onChange,
  framerate,
  display = TimeDisplay.SecondsPlusMilliseconds,
  disabled,
  variant = Variant.Default,
  size = Size.Md,
  min = 0,
  max = Infinity,
  bg = false,
  label,
  hidden = false,
}: TimeInputProps) {
  const [editing, setEditing] = useState<"minutes" | "seconds" | "milliseconds" | "frames" | null>(
    null,
  );

  const temporal = useTemporal({
    ms: value,
    framerate,
    format: display,
    onValidChange: (v) => {
      console.log("In time input changing", v);
      onChange(v);
    },
    min,
    max,
  });

  const actionPrevented = disabled || value === undefined;

  if (display === TimeDisplay.Frames) {
    return (
      <FramesInput
        variant={variant}
        disabled={actionPrevented}
        size={size}
        onFocus={() => setEditing("frames")}
        onBlur={() => setEditing(null)}
        min={min}
        max={max}
        value={temporal.frames}
        onChange={(v) => temporal.onChangeFrames(v.toString())}
      />
    );
  }

  const renderTimeInput = () => {
    return (
      <>
        {display === TimeDisplay.MinutesPlusSecondsPlusMilliseconds && (
          <>
            <StyledInput
              flex={false}
              disabled={actionPrevented}
              readOnly={actionPrevented}
              type="text"
              size={size}
              value={editing === "minutes" ? temporal.minutes : temporal.minutesDisplay}
              onFocus={() => {
                if (!actionPrevented) setEditing("minutes");
              }}
              onBlur={() => setEditing(null)}
              onChange={(e) => temporal.onChangeMinutes(e.target.value)}
              className={clsx("text-center", getWidth(temporal.minutesDisplay.length, size))}
            />
            <span className="w-fit">:</span>
          </>
        )}

        <StyledInput
          flex={false}
          disabled={actionPrevented}
          readOnly={actionPrevented}
          type="text"
          size={size}
          value={editing === "seconds" ? temporal.seconds : temporal.secondsDisplay}
          onFocus={() => {
            if (!actionPrevented) {
              setEditing("seconds");
            }
          }}
          onBlur={() => setEditing(null)}
          onChange={(e) => temporal.onChangeSeconds(e.target.value)}
          className={clsx(
            "text-center font-mono",
            getWidth(display === TimeDisplay.MinutesPlusSecondsPlusMilliseconds ? 2 : 3, size),
          )}
        />
        <span className="w-fit">.</span>
        <StyledInput
          flex={false}
          disabled={actionPrevented}
          readOnly={actionPrevented}
          type="text"
          size={size}
          value={editing === "milliseconds" ? temporal.milliseconds : temporal.millisecondsDisplay}
          onFocus={() => {
            if (!actionPrevented) {
              setEditing("milliseconds");
            }
          }}
          onBlur={() => setEditing(null)}
          onChange={(e) => temporal.onChangeMilliseconds(e.target.value)}
          className={clsx("text-center", getWidth(3, size))}
        />
      </>
    );
  };

  return (
    <label
      className={clsx(
        "responsive",
        bg ? "dark:bg-neutral-950/20 bg-neutral-50/20" : "bg-transparent",
        "dark:focus-within:bg-neutral-950/20 focus-within:bg-neutral-50/20",
        "relative flex justify-between w-full items-baseline gap-1",
        "text-black dark:text-white",
        "focus-within:outline focus-within:outline-offset-2",
        "px-1",
        hidden && "hidden",
        size,
        "sized-height",
        variant,
        "variant-responsive-appearing-outline",
        "variant-text-caret-color",
      )}
    >
      {label && (
        <span
          id={label}
          aria-label={label}
          className={clsx(size, "sized-text font-mono font-thin px-1 select-none")}
        >
          {label}
        </span>
      )}
      {renderTimeInput()}
    </label>
  );
}

interface FramesInputProps {
  value: number | undefined;
  variant?: Variant;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  size?: Size;
  onBlur?: () => void;
  onFocus?: () => void;
  min?: number;
  max?: number;
  bg?: boolean;
}

function FramesInput({
  value,
  variant,
  onChange,
  disabled,
  onBlur,
  onFocus,
  size = Size.Md,
  min = 0,
  max = Infinity,
}: FramesInputProps) {
  const {
    textValue,
    onChange: onChangeInner,
    onBlur: onBlurInner,
    onChangeHeadless,
  } = useNumeric({
    initial: value,
    onValidChange: onChange,
    min,
    max,
  });

  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current && value !== undefined) {
      onChangeHeadless(value || 0);
    }
  }, [value, onChangeHeadless]);

  return (
    <TextField
      disabled={disabled}
      variant={variant}
      readOnly={disabled}
      icon={<span className={clsx(size, "sized-text")}>f</span>}
      type="text"
      size={size}
      value={textValue}
      onFocus={() => {
        focusedRef.current = true;
        onFocus && onFocus();
      }}
      onBlur={(e) => {
        focusedRef.current = false;
        onBlurInner(e);
        onBlur && onBlur();
      }}
      className="text-right"
      onChange={(_, event) => onChangeInner(event)}
    />
  );
}
