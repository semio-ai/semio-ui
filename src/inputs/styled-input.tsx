import { ForwardedRef, type InputHTMLAttributes, forwardRef, memo } from "react";
import { clsx } from "clsx";
import { getHeight, getFontSize } from "../style-functions";
import { Size } from "../types";

interface InputProps {
  size: Size;
  focused?: boolean;
  cursor?: string;
  bold?: boolean;
  className?: string;
  flex?: boolean;
  subtle?: boolean;
}

export const StyledInput = memo(
  forwardRef(
    (
      {
        size = Size.Md,
        disabled,
        cursor,
        className,
        flex = true,
        bold,
        subtle,
        ...forwardedProps
      }: InputProps & Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
      ref: ForwardedRef<HTMLInputElement>,
    ) => {
      return (
        <input
          ref={ref}
          {...forwardedProps}
          type={forwardedProps.type ?? "text"}
          className={clsx(
            "touch-none font-mono outline-none bg-transparent pl-1 pr-1",
            flex && "w-full flex-1",
            subtle &&
              "focus:dark:text-white focus:text-black text-neutral-600 dark:text-neutral-400",
            !subtle && "text-black dark:text-white",
            bold ? "select-text font-bold" : "select-none font-normal",
            getHeight(size),
            getFontSize(size),
            disabled ? "cursor-not-allowed" : (cursor ?? "cursor-text"),
            className,
          )}
        />
      );
    },
  ),
);

StyledInput.displayName = "StyledInput";
