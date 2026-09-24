import type { ComponentPropsWithoutRef, RefAttributes } from "react";

/**
 * Props every Semio glyph accepts. The shape matches `@solar-icons/react-perf`'s
 * `IconProps`, so a Solar component and a Semio glyph fill the same registry slot
 * interchangeably.
 *
 * Declared here rather than imported from that package so `@semio/ui`'s published
 * type declarations carry no reference to it: the package is ESM-only, and a
 * CommonJS consumer's type resolution of an import from it is not something this
 * package should depend on.
 */
export interface GlyphProps extends ComponentPropsWithoutRef<"svg">, RefAttributes<SVGSVGElement> {
  alt?: string;
  color?: string;
  size?: string | number;
  mirrored?: boolean;
}
