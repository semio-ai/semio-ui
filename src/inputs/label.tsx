import { ReactNode } from "react";
import { clsx } from "clsx";
import { Variant } from "../types";

export function Label({
  children,
  variant,
  message,
  label,
}: {
  children: ReactNode;
  variant?: Variant;
  message?: string;
  label: string;
}) {
  return (
    <label>
      <div className="flex flex-row justify-between items-center p-0.5">
        <span className="capitalize text-md text-neutral-500">{label}</span>
        {message && (
          <span
            className={clsx("text-xs text-error-500", variant, "responsive variant-static-text")}
          >
            {message}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}
