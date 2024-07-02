import { useState, useEffect, type ChangeEvent } from "react";
import { clsx } from "clsx";
import { TimeDisplay } from "../types";

export interface TimeInputProps
  extends Omit<React.HTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  onChange: (value: number) => void;
  framerate: number;
  display: TimeDisplay;
  disabled?: boolean;
}

export function TimeInput({
  value,
  onChange,
  framerate,
  display,
  disabled,
}: TimeInputProps) {
  const [editing, setEditing] = useState<
    "minutes" | "seconds" | "milliseconds" | null
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
      <div className="flex space-x-2">
        <input
          disabled={disabled}
          type="text"
          value={editing === "minutes" ? minutes : `${minutes}`}
          onFocus={() => setEditing("minutes")}
          onBlur={() => setEditing(null)}
          onChange={(e) => handleSegmentChange(e, "minutes")}
          className={clsx(
            "w-12 text-center",
            editing === "minutes" ? "border-b-2 border-blue-500" : "",
          )}
        />
        <span>:</span>
        <input
          disabled={disabled}
          type="text"
          value={editing === "seconds" ? seconds : `${seconds}`}
          onFocus={() => setEditing("seconds")}
          onBlur={() => setEditing(null)}
          onChange={(e) => handleSegmentChange(e, "seconds")}
          className={clsx(
            "w-12 text-center",
            editing === "seconds" ? "border-b-2 border-blue-500" : "",
          )}
        />
        <span>.</span>
        <input
          disabled={disabled}
          type="text"
          value={editing === "milliseconds" ? milliseconds : `${milliseconds}`}
          onFocus={() => setEditing("milliseconds")}
          onBlur={() => setEditing(null)}
          onChange={(e) => handleSegmentChange(e, "milliseconds")}
          className={clsx(
            "w-12 text-center",
            editing === "milliseconds" ? "border-b-2 border-blue-500" : "",
          )}
        />
      </div>
    );
  };

  const renderFramesInput = () => {
    const { frames } = formatFrames(time);

    return (
      <input
        disabled={disabled}
        type="text"
        value={frames}
        onChange={(e) =>
          handleTimeChange((parseFloat(e.target.value) / framerate) * 1000)
        }
        className="w-full text-center border-b-2 border-blue-500"
      />
    );
  };

  return (
    <div className="flex flex-col items-center">
      {display === "seconds" ? renderTimeInput() : renderFramesInput()}
    </div>
  );
}
