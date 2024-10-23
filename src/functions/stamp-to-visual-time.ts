import { round } from "number-precision";
import { TimeDisplay } from "../types";

export function stampToVisualTime(
  stamp: number,
  duration: number,
  framerate: number,
  timeDisplay: TimeDisplay,
  showDetail?: boolean,
): string {
  const t = (stamp * duration) / 1000;
  if (timeDisplay === TimeDisplay.Frames) {
    if (showDetail) {
      return `${(t * framerate).toFixed(1)}f`;
    } else {
      return `${Math.floor(t * framerate).toString()}f`;
    }
  } else if (timeDisplay === TimeDisplay.Seconds) {
    if (showDetail) {
      return `${t.toFixed(3)}s`;
    } else {
      return `${(Math.floor(t * 100) / 100).toFixed(2)}s`;
    }
  } else if (timeDisplay === TimeDisplay.SecondsPlusFrames) {
    const seconds = Math.floor(t);
    const frames = round((t - seconds) * framerate, 2);
    return `${seconds.toString()}s ${frames.toString()}f`;
  } else {
    return `TODO`;
  }
}
