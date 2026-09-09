import figma from "@figma/code-connect";
import { Variant } from "../types";
import { StatusBadge } from "./status-badge";

/**
 * Code Connect for StatusBadge.
 *
 * Validated on the Professional plan via `npx figma connect parse`. File key lives
 * once in figma.config.json (`documentUrlSubstitutions`), not here.
 *
 * The Figma component is the badge **dot** (`variant-static-bg` fill + a
 * `surface/inset` ring); `Variant=primary` ↔ `variant="primary"`. In code StatusBadge
 * wraps `children` (the badged element) and positions the dot at a `placement`
 * corner — those are contextual, so the example passes a placeholder child.
 */
figma.connect(StatusBadge, "<SEMIO_UI_LIBRARY>?node-id=544-722", {
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
  example: ({ variant }) => (
    <StatusBadge variant={variant}>
      <span />
    </StatusBadge>
  ),
});
