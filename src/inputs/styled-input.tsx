import { ForwardedRef, type InputHTMLAttributes, forwardRef, memo } from "react";
import { getInputStyles } from "../style-functions";
import { Size } from "../types";

export interface InputProps {
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
          name={forwardedProps.name ?? "StyledInput"}
          ref={ref}
          {...forwardedProps}
          type={forwardedProps.type ?? "text"}
          className={getInputStyles(
            flex,
            subtle,
            bold,
            size,
            forwardedProps.disabled,
            className,
            cursor,
          )}
        />
      );
    },
  ),
);

StyledInput.displayName = "StyledInput";
