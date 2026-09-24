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
import { Size, Variant } from "../types";

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size" | "onChange"> {
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  variant?: Variant;
  color?: string;
  bg?: boolean;
  outline?: "hidden" | "interact" | "always";
  subtle?: boolean;
  /**
   * Type scale, matching the sibling inputs.
   *
   * **No default, deliberately.** Without it the text inherits, which is what
   * every existing caller has been getting; a default here would resize all of
   * them. So this is opt-in.
   *
   * Pass it wherever a text area sits beside a `TextField`, `Combobox` or
   * `NumberField`. Those size their text from this scale, and a text area that
   * inherits instead lands on whatever the surrounding font happens to be —
   * which is how one settings row came to hold a 16px description field beside
   * a 12px name field, in a dialog where the two are read as a pair.
   *
   * Only the type scale. Height belongs to `rows`, the element's own way of
   * saying how many lines it stands open at.
   */
  size?: Size;
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
      size,
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
          "variant-scope",
          bg && "bg-neutral-50/20 dark:bg-neutral-950/20",
          "rounded-xs",
          // Both classes together or neither: `sized-text` reads the scale from
          // the `size-*` class beside it, so on its own it resolves to the
          // fallback rather than to nothing, and would resize every caller that
          // passes no size.
          size && [size, "sized-text"],
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
