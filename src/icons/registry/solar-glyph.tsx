import { createElement, type ComponentType } from "react";
import { clsx } from "clsx";
import type { IconComponent } from "./types";

/** Apply shared sizing and optional presentation classes to a Solar glyph. */
export function createSolarIcon(
  Component: ComponentType<{ size?: string | number; className?: string }>,
  presentationClass?: string,
): IconComponent {
  return function SolarGlyph({ className, ...props }) {
    return createElement(Component, {
      size: "18px",
      ...props,
      className: clsx(presentationClass, className) || undefined,
    });
  };
}
