import figma from "@figma/code-connect";
import { Variant } from "../types";
import { Tooltip } from "./tooltip";

/**
 * Code Connect for Tooltip — a `card` popover (surface/inset + border + shadow) with
 * variant-colored text + a carrot arrow. `Variant=primary` ↔ `variant="primary"`.
 * `content` is arbitrary and `children` is the trigger, so both are illustrative.
 */
figma.connect(Tooltip, "<SEMIO_UI_LIBRARY>?node-id=584-829", {
  props: {
    variant: figma.enum("Variant", {
      default: Variant.Default,
      primary: Variant.Primary,
      secondary: Variant.Secondary,
      tertiary: Variant.Tertiary,
      error: Variant.Error,
    }),
  },
  example: ({ variant }) => (
    <Tooltip content="Tooltip" variant={variant}>
      <span />
    </Tooltip>
  ),
});
