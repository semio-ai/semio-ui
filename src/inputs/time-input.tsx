import { TimeDisplay } from "../types";
import { useTemporal } from "../hooks/use-temporal";
import { NumberField, NumberFieldProps } from "./number-field";

export interface TimeInputProps extends Omit<NumberFieldProps, "value" | "onChange"> {
  value: number | undefined;
  onChange: (value: number) => void;
  framerate: number;
  display?: TimeDisplay;
}

/**
 * A wrapper around a number field that displays time in frames, seconds, or milliseconds.
 */
export function TimeInput({
  value,
  onChange,
  framerate,
  display = TimeDisplay.Frames,
  min = 0,
  max = Infinity,
  ...forwardedProps
}: TimeInputProps) {
  const temporal = useTemporal({
    ms: value,
    framerate,
    onChange,
  });

  if (display === TimeDisplay.Frames) {
    return (
      <NumberField
        {...forwardedProps}
        units="f"
        min={(min / 1000) * framerate}
        max={(max / 1000) * framerate}
        value={temporal.frames}
        onChange={(v) => temporal.updateFrames(v)}
      />
    );
  }

  if (display === TimeDisplay.Seconds) {
    return (
      <NumberField
        {...forwardedProps}
        units="s"
        min={min / 1000}
        max={max / 1000}
        value={temporal.seconds}
        onChange={(v) => temporal.updateSeconds(v)}
      />
    );
  }

  if (display === TimeDisplay.Milliseconds) {
    return (
      <NumberField
        {...forwardedProps}
        units="ms"
        min={min}
        max={max}
        value={value ?? 0}
        onChange={onChange}
      />
    );
  }
}
