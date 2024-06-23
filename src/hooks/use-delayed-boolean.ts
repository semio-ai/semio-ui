import { useState, useEffect } from "react";

export function useDelayedBoolean(
  value: boolean,
  timeoutDuration: number,
): boolean {
  const [delayedValue, setDelayedValue] = useState<boolean>(value);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    if (!value) {
      setTimer(
        window.setTimeout(() => {
          setDelayedValue(false);
        }, timeoutDuration),
      );
    } else {
      clearTimeout(timer!);
      setDelayedValue(true);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [value, timeoutDuration]);

  return delayedValue;
}
