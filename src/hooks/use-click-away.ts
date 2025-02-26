import { useEffect, useCallback } from "react";

/**
 * Custom hook to detect clicks outside a specified element.
 * @param onClickAway - A callback function triggered when a click outside the element occurs.
 * @param ref - An optional ref to be attached to the element you want to monitor.
 */
export function useClickAway<T extends HTMLElement | null>(
  ref: React.RefObject<T>,
  onClickAway: (event: MouseEvent | TouchEvent) => void,
) {
  const handleClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickAway(event);
      }
    },
    [onClickAway, ref],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [handleClick]);
}
