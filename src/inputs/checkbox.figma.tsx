import figma from "@figma/code-connect";
import { Variant } from "../types";
import { Checkbox } from "./checkbox";

/**
 * Code Connect for Checkbox.
 *
 * Validated on the Professional plan via `npx figma connect parse` (only
 * `figma connect publish` is Organization/Enterprise-gated). File key lives once
 * in figma.config.json (`documentUrlSubstitutions`), not here.
 *
 * Contract: `Variant=primary` ↔ `variant="primary"`. The Figma `State` axis
 * carries the boolean model — `checked`/`unchecked` map to the `checked` prop and
 * `disabled` maps to the `disabled` prop (the disabled variant is drawn checked,
 * matching the Storybook Disabled story). Hover/focus (the appearing-outline ring)
 * is prototype interactivity, not an axis.
 */
figma.connect(Checkbox, "<SEMIO_UI_LIBRARY>?node-id=503-913", {
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
    checked: figma.enum("State", { checked: true, disabled: true, unchecked: false }),
    disabled: figma.enum("State", { disabled: true, checked: false, unchecked: false }),
  },
  example: ({ variant, checked, disabled }) => (
    <Checkbox variant={variant} checked={checked} disabled={disabled} onCheckedChange={() => {}} />
  ),
});
