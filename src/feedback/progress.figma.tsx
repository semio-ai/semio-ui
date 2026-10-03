import figma from "@figma/code-connect";
import { Variant } from "../types";
import { Progress, ProgressCircle } from "./progress";

/**
 * Code Connect for Progress (bar) and ProgressCircle.
 *
 * Validated on the Professional plan via `npx figma connect parse`. File key lives
 * once in figma.config.json (`documentUrlSubstitutions`), not here.
 *
 * `Variant=primary` ↔ `variant="primary"`. `progress` is a runtime number (the
 * Figma sets render a fixed ~60% demo, not a variant/property), so the example
 * shows a representative value. ProgressCircle's `Show icon`/`Icon` map to the
 * optional centered `icon`. (figma.enum requires an inline object literal — the
 * 8-variant map is repeated in each connect rather than shared.)
 */
figma.connect(Progress, "<SEMIO_UI_LIBRARY>?node-id=527-730", {
  props: {
    variant: figma.enum("Variant", {
      default: Variant.Default,
      primary: Variant.Primary,
      secondary: Variant.Secondary,
      tertiary: Variant.Tertiary,
      error: Variant.Error,
      success: Variant.Success,
      warning: Variant.Warning,
      info: Variant.Info,
    }),
  },
  example: ({ variant }) => <Progress progress={0.6} variant={variant} />,
});

figma.connect(ProgressCircle, "<SEMIO_UI_LIBRARY>?node-id=529-1093", {
  props: {
    variant: figma.enum("Variant", {
      default: Variant.Default,
      primary: Variant.Primary,
      secondary: Variant.Secondary,
      tertiary: Variant.Tertiary,
      error: Variant.Error,
      success: Variant.Success,
      warning: Variant.Warning,
      info: Variant.Info,
    }),
    icon: figma.boolean("Show icon", {
      true: figma.instance("Icon"),
      false: undefined,
    }),
  },
  example: ({ variant, icon }) => <ProgressCircle progress={0.6} variant={variant} icon={icon} />,
});
