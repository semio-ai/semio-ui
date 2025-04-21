import { ForwardedRef, ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { Variant, Size } from "../types";

export interface CallToActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant.Primary | Variant.Secondary | Variant.Tertiary;
  size: Size.Lg | Size.Md | Size.Sm;
}

export const CallToActionButton = forwardRef(
  (
    { variant, size, className, ...props }: CallToActionButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        {...props}
        className={clsx(
          "transition-colors capitalize",
          "dark:text-white text-black",
          "py-2 px-4 flex flex-row items-center",
          size,
          "sized-height",
          "sized-text",
          backgroundStyles[variant],
          borderStyles[variant],
          className,
        )}
      />
    );
  },
);

CallToActionButton.displayName = "CallToActionButton";

const backgroundStyles = {
  [Variant.Primary]: "bg-neutral-500/25 hover:bg-primary-500 disabled:bg-neutral-500/25",
  [Variant.Secondary]: "bg-neutral-500/25 hover:bg-secondary-500 disabled:bg-neutral-500/25",
  [Variant.Tertiary]: "bg-neutral-500/25 hover:bg-tertiary-500 disabled:bg-neutral-500/25",
};

const borderStyles = {
  [Variant.Primary]:
    "outline outline-1 outline-offset-0 outline-primary-500 focus:outline-offset-2 disabled:outline-primary-500/50",
  [Variant.Secondary]:
    "outline outline-1 outline-offset-0 outline-secondary-500 focus:outline-offset-2 disabled:outline-secondary-500/50",
  [Variant.Tertiary]:
    "outline outline-1 outline-offset-0 outline-tertiary-500 focus:outline-offset-2 disabled:outline-tertiary-500/50",
};
