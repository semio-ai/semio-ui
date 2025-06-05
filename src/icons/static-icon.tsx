import { clsx } from "clsx";
import { CSSProperties, ReactNode } from "react";
import { alpha, altColor } from "@semio/utils";
import { Variant, Size } from "../types";

export interface StaticIconProps {
  children: ReactNode;
  variant?: Variant;
  color?: string;
  size?: Size | "fit";
  deemphasize?: boolean;
  className?: string;
}
export function StaticIcon({
  children,
  variant,
  size,
  color,
  deemphasize,
  className,
}: StaticIconProps) {
  return (
    <span
      className={clsx(
        "transition-all",
        size,
        variant,
        color && !deemphasize && "text-(--text-color)",
        color && deemphasize && "text-(--text-deemphasized-color)",
        !color && "variant-static-text",
        "place-items-center",
        size === "fit" ? "h-fit w-fit" : "sized-height",
        className ?? "",
      )}
      style={
        color
          ? ({
              "--text-color": color,
              "--darker-color": altColor(color, -0.2),
              "--lighter-color": altColor(color, 0.2),
              "--text-deemphasized-color": alpha(color, 0.5),
              "--darker-deemphasized-color": alpha(altColor(color, -0.2), 0.5),
              "--lighter-deemphasized-color": alpha(altColor(color, 0.2), 0.5),
            } as CSSProperties)
          : undefined
      }
    >
      {children}
    </span>
  );
}
