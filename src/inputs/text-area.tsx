import {
  memo,
  forwardRef,
  type ReactNode,
  type ForwardedRef,
  type TextareaHTMLAttributes,
  type ChangeEvent,
} from "react";
import { clsx } from "clsx";
import { Variant } from "../types";

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "onChange"> {
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  variant?: Variant;
  bg?: boolean;
  outline?: "hidden" | "interact" | "always";
  subtle?: boolean;
}

/**
 * Inherits from standard Input HTML element
 * @param value - the value of the field
 * @param onChange - the callback to call when the value changes
 * @param variant - the variant of the field
 * @param bg - whether to show the field with a background
 * @param outline - whether to show the field with an outline on focus
 */
const InnerTextArea = forwardRef(
  (
    {
      onChange,
      variant = Variant.Default,
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
        className={clsx(
          bg && "dark:bg-neutral-950/20 bg-neutral-50/20",
          "rounded-xs",
          outline === "interact" && "variant-responsive-appearing-outline",
          outline === "always" && "variant-responsive-persistent-outline",
          variant,
          "disabled:cursor-not-allowed cursor-text",
          "p-1",
          "variant-text-carent-color",
          subtle && "dark:focus:text-white focus:text-black text-neutral-600 dark:text-neutral-400",
          !subtle && "text-black dark:text-white",
          className,
        )}
      />
    );
  },
);

InnerTextArea.displayName = "TextArea";

export const TextArea = memo(InnerTextArea);
