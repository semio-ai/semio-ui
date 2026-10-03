import { ReactNode } from "react";
import { clsx } from "clsx";
import { Variant } from "../types";

export function Label({
  children,
  variant,
  message,
  label,
  htmlFor,
}: {
  children: ReactNode;
  variant?: Variant;
  message?: string;
  label: string;
  /** Associates the label with an input element by id. */
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor}>
      <div className="flex flex-row items-center justify-between p-0.5">
        <span className="text-md text-neutral-500 capitalize">{label}</span>
        {message && (
          <span
            className={clsx(
              "text-xs",
              variant ?? Variant.Error,
              "variant-scope variant-static-text",
            )}
          >
            {message}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}
