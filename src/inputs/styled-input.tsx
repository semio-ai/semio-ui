import { type InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface InputProps {
  sizeVariant: keyof typeof heightLookup;
  focused?: boolean;
  inactive?: boolean;
  cursor?: string;
  bold?: boolean;
  className?: string;
}

export const heightLookup = {
  sm: "h-7",
  md: "h-8",
  lg: "h-10",
};

export const fontSizeLookup = {
  sm: "text-xs",
  md: "text-base",
  lg: "text-xl",
};

export function StyledInput(
  props: InputProps & InputHTMLAttributes<HTMLInputElement>,
) {
  const { bold, sizeVariant, disabled, cursor, className, ...forwardedProps } =
    props;
  return (
    <input
      {...forwardedProps}
      type="text"
      className={clsx(
        "w-full touch-none font-mono outline-none bg-transparent pl-1 pr-1",
        "dark:text-white text-black",
        bold ? "select-text font-bold" : "select-none font-normal",
        sizeVariant ? heightLookup[sizeVariant] : heightLookup.md,
        sizeVariant ? fontSizeLookup[sizeVariant] : fontSizeLookup.md,
        disabled ? "cursor-not-allowed" : cursor ?? "cursor-text",
        className,
      )}
    />
  );
}
