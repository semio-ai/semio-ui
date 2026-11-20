import { forwardRef, useLayoutEffect, useRef, type ComponentPropsWithoutRef } from "react";

/** Pixel dimensions keep the public size variables usable after opening animations. */
export const SizePanel = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div"> & { accordion?: boolean }
>(function SizePanel({ accordion = false, style, ...props }, forwardedRef) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const prefix = accordion ? "accordion" : "collapsible";
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    for (const [dimension, pixels] of [
      ["height", element.scrollHeight],
      ["width", element.scrollWidth],
    ] as const) {
      const variable = `--${prefix}-panel-${dimension}`;
      if (element.style.getPropertyValue(variable) === "auto") {
        element.style.setProperty(variable, `${pixels}px`);
      }
    }
  });
  return (
    <div
      {...props}
      ref={(element) => {
        elementRef.current = element;
        if (typeof forwardedRef === "function") return forwardedRef(element);
        if (forwardedRef) forwardedRef.current = element;
      }}
      style={style}
    />
  );
});
