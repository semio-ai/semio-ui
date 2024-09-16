import { round } from "number-precision";
import { TimeDisplay } from "../types";

export function stampToVisualTime(
  stamp: number,
  duration: number,
  framerate: number,
  timeDisplay: TimeDisplay,
): string {
  const t = (stamp * duration) / 1000;
  if (timeDisplay === TimeDisplay.Frames) {
    let str = round(t * framerate, 1).toString();
    return `${str}f`;
    const split = str.split(".");
    if (split[0].length === 1) {
      str = `00${str}`;
    } else if (split[0].length === 2) {
      str = `0${str}`;
    }
    if (!split[1]) {
      str = `${str}.0`;
    }
    if (split[0].length > 3) {
      str = `999+f`;
    }
    return `${str}f`;
  } else if (timeDisplay === TimeDisplay.Seconds) {
    return `${round(t, 2).toString()}s`;
  } else if (timeDisplay === TimeDisplay.SecondsPlusFrames) {
    const seconds = Math.floor(t);
    const frames = round((t - seconds) * framerate, 2);
    return `${seconds.toString()}s ${frames.toString()}f`;
  } else {
    return `TODO`;
  }
}
