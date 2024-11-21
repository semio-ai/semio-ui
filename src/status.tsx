import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Variant } from "./types";
import { getChipColor } from "./style-functions";

export interface StatusProps {
  variant?: Variant;
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  children: ReactNode;
  text?: string;
}

export function Status({
  variant = Variant.Default,
  placement = "top-right",
  text,
  children,
}: StatusProps) {
  return (
    <div className="relative">
      {children}
      <div
        className={clsx(
          "bg-success-500 rounded-full absolute ring-1 dark:ring-neutral-800 ring-neutral-200",
          text
            ? "h-2 min-w-2 text-[7px] p-[1] text-black font-bold flex flex-row items-center justify-center"
            : "h-2 w-2",
          getChipColor(variant),
          getPlacement(placement),
        )}
        style={text ? { width: text.length * 6 } : undefined}
      >
        {text}
      </div>
    </div>
  );
}

function getPlacement(
  placement: "top-left" | "top-right" | "bottom-left" | "bottom-right",
): string {
  switch (placement) {
    case "top-left":
      return "top-0 left-0";
    case "top-right":
      return "top-0 right-0";
    case "bottom-left":
      return "bottom-0 left-0";
    case "bottom-right":
      return "bottom-0 right-0";
  }
}
