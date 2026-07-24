import figma from "@figma/code-connect";
import { Variant } from "./types";
import { Chip } from "./chip";

/**
 * Code Connect for Chip.
 *
 * Validated on the Professional plan via `npx figma connect parse`. File key lives
 * once in figma.config.json (`documentUrlSubstitutions`), not here.
 *
 * Contract: `Variant=primary` ↔ `variant="primary"`. `Show icon` gates the `Icon`
 * instance-swap (the `icon` slot), and `Show delete` gates the delete affordance
 * (`onDelete`). Chip has no interactive-state axis — it's a static badge.
 */
figma.connect(Chip, "<SEMIO_UI_LIBRARY>?node-id=523-1050", {
  props: {
    children: figma.string("Label"),
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
    onDelete: figma.boolean("Show delete", {
      true: () => undefined,
      false: undefined,
    }),
  },
  example: ({ children, variant, icon, onDelete }) => (
    <Chip variant={variant} icon={icon} onDelete={onDelete}>
      {children}
    </Chip>
  ),
});
