import { useState, useEffect, type ChangeEvent } from "react";
import { clsx } from "clsx";
import { TimeDisplay, Variant } from "../types";
import { getOutline } from "../variant-colors";
import { useTemporal } from "../hooks/use-temporal";
import { StyledInput, heightLookup } from "./styled-input";

export interface TimeInputProps
  extends Omit<React.HTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number | undefined;
  onChange: (value: number) => void;
  framerate: number;
  display: TimeDisplay;
  disabled?: boolean;
  min: number;
  max: number;
  variant: Variant;
  size?: "sm" | "md" | "lg";
}

const widthLookup = {
  [TimeDisplay.Frames]: {
    sm: "w-[83px]",
    md: "w-[100px]",
    lg: "w-[115px]",
  },
  [TimeDisplay.MinutesPlusSecondsPlusMilliseconds]: {
    sm: "w-[120px]",
    md: "w-[180px]",
    lg: "w-[210px]",
  },
  [TimeDisplay.SecondsPlusMilliseconds]: {
    sm: "w-[100px]",
    md: "w-[120px]",
    lg: "w-[140px]",
  },
};

export function TimeInput({
  value,
  onChange,
  framerate,
  display,
  disabled,
  variant = Variant.Default,
  size = "md",
  min,
  max,
}: TimeInputProps) {
  const [editing, setEditing] = useState<
    "minutes" | "seconds" | "milliseconds" | "frames" | null
  >(null);

  const temporal = useTemporal({
    ms: value,
    framerate,
    format: display,
    onValidChange: onChange,
    min,
    max,
  });

  const renderTimeInput = () => {
    return (
      <>
        {display === TimeDisplay.MinutesPlusSecondsPlusMilliseconds && (
          <>
            <StyledInput
              disabled={disabled || value === undefined}
              readOnly={disabled || value === undefined}
              type="text"
              sizeVariant={size}
              value={
                editing === "minutes"
                  ? temporal.minutes
                  : temporal.minutesDisplay
              }
              onFocus={() => setEditing("minutes")}
              onBlur={() => setEditing(null)}
              onChange={(e) => temporal.onChangeMinutes(e.target.value)}
              className="text-center"
            />
            <span>:</span>
          </>
        )}

        <StyledInput
          disabled={disabled || value === undefined}
          readOnly={disabled || value === undefined}
          type="text"
          sizeVariant={size}
          value={
            editing === "seconds" ? temporal.seconds : temporal.secondsDisplay
          }
          onFocus={() => setEditing("seconds")}
          onBlur={() => setEditing(null)}
          onChange={(e) => temporal.onChangeSeconds(e.target.value)}
          className="text-center"
        />
        <span>.</span>
        <StyledInput
          disabled={disabled || value === undefined}
          readOnly={disabled || value === undefined}
          type="text"
          sizeVariant={size}
          value={
            editing === "milliseconds"
              ? temporal.milliseconds
              : temporal.millisecondsDisplay
          }
          onFocus={() => setEditing("milliseconds")}
          onBlur={() => setEditing(null)}
          onChange={(e) => temporal.onChangeMilliseconds(e.target.value)}
          className="text-center"
        />
      </>
    );
  };

  const renderFramesInput = () => {
    return (
      <StyledInput
        disabled={disabled || value === undefined}
        readOnly={disabled || value === undefined}
        type="text"
        sizeVariant={size}
        value={editing === "frames" ? temporal.frames : temporal.framesDisplay}
        onFocus={() => setEditing("frames")}
        onBlur={() => setEditing(null)}
        onChange={(e) => temporal.onChangeFrames(e.target.value)}
        className="text-center"
      />
    );
  };

  return (
    <div
      className={clsx(
        "flex items-baseline",
        editing !== null && "outline outline-1 outline-offset-2",
        getOutline(variant),
        heightLookup[size],
        widthLookup[display]?.[size] ?? "",
      )}
    >
      {display === TimeDisplay.Frames ? renderFramesInput() : renderTimeInput()}
    </div>
  );
}
