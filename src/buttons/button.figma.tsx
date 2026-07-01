import figma from "@figma/code-connect";
import { Variant } from "../types";
import { Button } from "./button";

/**
 * Code Connect for Button.
 *
 * Validated on the Professional plan via `npx figma connect parse` (only
 * `figma connect publish` is Organization/Enterprise-gated), so this is a
 * literal drop-in once the plan upgrades — no rework. The Figma file key lives
 * once in figma.config.json (`documentUrlSubstitutions`), not here.
 *
 * Contract: each Figma variant option name equals the code prop value
 * (`Variant=primary` ↔ `variant="primary"`), mirroring the icon contract
 * (registry key == `Icon/<key>` == `<Icon name>`).
 */
figma.connect(Button, "<SEMIO_UI_LIBRARY>?node-id=191-127", {
  props: {
    // "Show label" off → icon-only (no children); on → the Label text.
    children: figma.boolean("Show label", {
      true: figma.string("Label"),
      false: undefined,
    }),
    variant: figma.enum("Variant", {
      default: Variant.Default,
      primary: Variant.Primary,
      secondary: Variant.Secondary,
      tertiary: Variant.Tertiary,
      error: Variant.Error,
    }),
    visuals: figma.enum("Visual", {
      default: "default",
      inverted: "inverted",
      "inverted-border": "inverted-border",
    }),
    // Icon slots: the show-toggle gates the instance-swap glyph. The swapped
    // Icon/<key> renders via its own Code Connect (see icon.figma.tsx).
    leftIcon: figma.boolean("Left icon", {
      true: figma.instance("Icon left"),
      false: undefined,
    }),
    rightIcon: figma.boolean("Right icon", {
      true: figma.instance("Icon right"),
      false: undefined,
    }),
  },
  example: ({ children, variant, visuals, leftIcon, rightIcon }) => (
    <Button variant={variant} visuals={visuals} leftIcon={leftIcon} rightIcon={rightIcon}>
      {children}
    </Button>
  ),
});
