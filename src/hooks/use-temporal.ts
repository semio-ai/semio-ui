import { useEffect, useState } from "react";
import { TimeDisplay } from "../types";
import { clamp } from "lodash";

interface TemporalProps {
  ms?: number;
  framerate: number;
  onValidChange?: (value: number) => void;
  format: TimeDisplay;
  min?: number;
  max?: number;
}

interface TemporalState {
  minutes: number;
  seconds: number;
  milliseconds: number;
  frames: number;
  minutesDisplay: string;
  secondsDisplay: string;
  millisecondsDisplay: string;
  framesDisplay: string;
  onChangeMinutes: (value: string) => void;
  onChangeSeconds: (value: string) => void;
  onChangeMilliseconds: (value: string) => void;
  onChangeFrames: (value: string) => void;
}

export const useTemporal = ({
  ms = 0,
  framerate,
  format,
  onValidChange = () => {},
  min = -Infinity,
  max = Infinity,
}: TemporalProps): TemporalState => {
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [milliseconds, setMilliseconds] = useState<number>(0);
  const [frames, setFrames] = useState<number>(0);
  const [framesDisplay, setFramesDisplay] = useState<string>("0");

  // useEffect(() => {
  //   onValidChange(clamp(value, min, max));
  // }, [value, onValidChange, min, max]);

  useEffect(() => {
    setFramesDisplay(frames.toFixed(2));
    setFrames(((ms || 0) / 1000) * framerate);
    setMilliseconds(Math.floor((ms || 0) % 1000));
    if (format === TimeDisplay.MinutesPlusSecondsPlusMilliseconds) {
      const mins = Math.floor((ms || 0) / 60000);
      const secs = Math.floor(((ms || 0) % 60000) / 1000);
      setMinutes(mins);
      setSeconds(secs);
    } else if (format === TimeDisplay.SecondsPlusMilliseconds) {
      const secs = Math.floor((ms || 0) / 1000);
      setMinutes(0);
      setSeconds(secs);
    }
  }, [ms, format, framerate, frames]);

  const onChangeMinutes = (v: string) => {
    const newMinutes = parseInt(v);
    if (!isNaN(newMinutes)) {
      const newValue = clamp(
        newMinutes * 60000 + seconds * 1000 + milliseconds,
        min,
        max,
      );
      onValidChange(newValue);
    }
  };

  const onChangeSeconds = (v: string) => {
    const newSeconds = parseInt(v);
    if (!isNaN(newSeconds)) {
      const newValue = clamp(
        minutes * 60000 + newSeconds * 1000 + milliseconds,
        min,
        max,
      );
      onValidChange(newValue);
    }
  };

  const onChangeMilliseconds = (v: string) => {
    const newMilliseconds = parseInt(v);
    if (!isNaN(newMilliseconds)) {
      const newValue = clamp(
        minutes * 60000 + seconds * 1000 + newMilliseconds,
        min,
        max,
      );
      onValidChange(newValue);
    }
  };

  const onChangeFrames = (v: string) => {
    const newFrames = parseInt(v);
    setFramesDisplay(v);
    if (!isNaN(newFrames)) {
      const newValue = clamp((newFrames / framerate) * 1000, min, max);
      onValidChange(newValue);
    }
  };

  const secondsLength =
    format === TimeDisplay.MinutesPlusSecondsPlusMilliseconds ? 2 : 3;

  return {
    minutes,
    seconds,
    milliseconds,
    frames,
    minutesDisplay: ms !== undefined ? padNumber(minutes, 2) : emptyRender(2),
    secondsDisplay:
      ms !== undefined
        ? padNumber(seconds, secondsLength)
        : emptyRender(secondsLength),
    millisecondsDisplay:
      ms !== undefined ? padNumber(milliseconds, 3) : emptyRender(3),
    framesDisplay: ms !== undefined ? frames.toFixed(2) : emptyRender(2),
    onChangeMinutes,
    onChangeSeconds,
    onChangeMilliseconds,
    onChangeFrames,
  };
};

const padNumber = (num: number, length: number) =>
  String(num).padStart(length, "0");
const emptyRender = (length: number) =>
  Array.from({ length }, () => "-").join("");
