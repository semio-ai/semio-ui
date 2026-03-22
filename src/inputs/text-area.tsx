import {
  memo,
  forwardRef,
  type ReactNode,
  type ForwardedRef,
  type TextareaHTMLAttributes,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { clsx } from "clsx";
import { Variant } from "../types";

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "onChange"> {
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  variant?: Variant;
  color?: string;
  bg?: boolean;
  outline?: "hidden" | "interact" | "always";
  subtle?: boolean;
}

/**
 * Inherits from standard Input HTML element
 * @param value - the value of the field
 * @param onChange - the callback to call when the value changes
 * @param variant - the variant of the field
 * @param color - [optional] custom color to override the variant
 * @param bg - whether to show the field with a background
 * @param outline - whether to show the field with an outline on focus
 */
const InnerTextArea = forwardRef(
  (
    {
      onChange,
      variant = Variant.Default,
      color,
      bg = false,
      outline = "interact",
      className,
      subtle,
      ...forwardedProps
    }: TextAreaProps,
    ref: ForwardedRef<HTMLTextAreaElement>,
  ): ReactNode => {
    return (
      <textarea
        ref={ref}
        {...forwardedProps}
        onChange={(event) => onChange?.(event.target.value, event)}
        style={
          {
            "--custom-color": color,
          } as CSSProperties
        }
        className={clsx(
          "responsive",
          bg && "bg-neutral-50/20 dark:bg-neutral-950/20",
          "rounded-xs",
          outline === "interact" && "variant-responsive-appearing-outline",
          outline === "always" && "variant-responsive-persistent-outline",
          color ? "custom-color" : variant,
          "cursor-text disabled:cursor-not-allowed",
          "p-1",
          "variant-text-caret-color",
          subtle && "text-neutral-600 focus:text-black dark:text-neutral-400 dark:focus:text-white",
          !subtle && "text-black dark:text-white",
          className,
        )}
      />
    );
  },
);

InnerTextArea.displayName = "TextArea";

export const TextArea = memo(InnerTextArea);
