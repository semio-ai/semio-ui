import figma from "@figma/code-connect";
import { Variant } from "../types";
import { SliderNumberField } from "./slider-number-field";

/**
 * Code Connect for SliderNumberField — a numeric field with the
 * `variant-input-gradient-bg` slider fill. `Variant=primary` ↔ `variant="primary"`.
 * `value`/`label` are runtime data (the Figma renders a ~60% demo), shown as an
 * illustrative example.
 */
figma.connect(SliderNumberField, "<SEMIO_UI_LIBRARY>?node-id=585-833", {
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
    <SliderNumberField value={0.6} onChange={() => undefined} variant={variant} label="Value" />
  ),
});
