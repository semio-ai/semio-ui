import { useState, useEffect, type ChangeEvent } from "react";
import { clsx } from "clsx";
import { TimeDisplay, Variant } from "../types";
import { StyledInput, heightLookup } from "./styled-input";
import { getOutline } from "../variant-colors";

export interface SliderNumberFieldProps {
  value: number;
  onChange: (value: number) => void;

  units?: string;
  color?: string;
  strict?: boolean;

  inactive?: boolean;
  disabled?: boolean;
}

export interface TimeInputProps
  extends Omit<React.HTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
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
  sm: "w-[83px]",
  md: "w-[100px]",
  lg: "w-[115px]",
};

export function TimeInput({
  value,
  onChange,
  framerate,
  display,
  disabled,
  variant = Variant.DEFAULT,
  size = "md",
}: TimeInputProps) {
  const [editing, setEditing] = useState<
    "minutes" | "seconds" | "milliseconds" | "frames" | null
  >(null);
  const [time, setTime] = useState(value);

  useEffect(() => {
    setTime(value);
  }, [value]);

  const handleTimeChange = (newTime: number) => {
    setTime(newTime);
    if (onChange) {
      onChange(newTime);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;

    return {
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      milliseconds: Math.floor(milliseconds / 10)
        .toString()
        .padStart(2, "0"),
    };
  };

  const formatFrames = (ms: number) => {
    const totalFrames = Math.floor((ms / 1000) * framerate);
    return {
      frames: totalFrames.toFixed(2).toString(),
    };
  };

  const handleSegmentChange = (
    e: ChangeEvent<HTMLInputElement>,
    segment: "minutes" | "seconds" | "milliseconds",
  ) => {
    const value = parseInt(e.target.value, 10);
    const { minutes, seconds, milliseconds } = formatTime(time);

    let newTime;
    if (segment === "minutes") {
      newTime =
        (value * 60 + parseInt(seconds, 10)) * 1000 +
        parseInt(milliseconds, 10) * 10;
    } else if (segment === "seconds") {
      newTime =
        (parseInt(minutes, 10) * 60 + value) * 1000 +
        parseInt(milliseconds, 10) * 10;
    } else if (segment === "milliseconds") {
      newTime =
        parseInt(minutes, 10) * 60 * 1000 +
        parseInt(seconds, 10) * 1000 +
        value * 10;
    }

    handleTimeChange(newTime!);
  };

  const renderTimeInput = () => {
    const { minutes, seconds, milliseconds } = formatTime(time);

    return (
      <>
        <StyledInput
          disabled={disabled}
          color="#ff0000"
          type="text"
          sizeVariant={size}
          value={editing === "minutes" ? minutes : `${minutes}`}
          onFocus={() => setEditing("minutes")}
          onBlur={() => setEditing(null)}
          onChange={(e) => handleSegmentChange(e, "minutes")}
          className="text-center"
        />
        <span>:</span>
        <StyledInput
          disabled={disabled}
          color="#ff0000"
          type="text"
          sizeVariant={size}
          value={editing === "seconds" ? seconds : `${seconds}`}
          onFocus={() => setEditing("seconds")}
          onBlur={() => setEditing(null)}
          onChange={(e) => handleSegmentChange(e, "seconds")}
          className="text-center"
        />
        <span>.</span>
        <StyledInput
          disabled={disabled}
          color="#ff0000"
          type="text"
          sizeVariant={size}
          value={editing === "milliseconds" ? milliseconds : `${milliseconds}`}
          onFocus={() => setEditing("milliseconds")}
          onBlur={() => setEditing(null)}
          onChange={(e) => handleSegmentChange(e, "milliseconds")}
          className="text-center"
        />
      </>
    );
  };

  const renderFramesInput = () => {
    const { frames } = formatFrames(time);

    return (
      <StyledInput
        disabled={disabled}
        color="#ff0000"
        type="text"
        sizeVariant={size}
        value={frames}
        onFocus={() => setEditing("frames")}
        onBlur={() => setEditing(null)}
        onChange={(e) =>
          handleTimeChange((parseFloat(e.target.value) / framerate) * 1000)
        }
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
        widthLookup[size],
      )}
    >
      {display === "seconds" ? renderTimeInput() : renderFramesInput()}
    </div>
  );
}
