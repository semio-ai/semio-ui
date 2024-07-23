import { type InputHTMLAttributes } from "react";
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
}

export function StyledInput({
  size = Size.Md,
  disabled,
  cursor,
  className,
  flex = true,
  bold,
  ...forwardedProps
}: InputProps & Omit<InputHTMLAttributes<HTMLInputElement>, "size">) {
  return (
    <input
      {...forwardedProps}
      type="text"
      className={clsx(
        "touch-none font-mono outline-none bg-transparent pl-1 pr-1",
        flex && "w-full",
        "dark:text-white text-black",
        bold ? "select-text font-bold" : "select-none font-normal",
        getHeight(size),
        getFontSize(size),
        disabled ? "cursor-not-allowed" : cursor ?? "cursor-text",
        className,
      )}
    />
  );
}
