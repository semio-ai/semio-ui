import figma from "@figma/code-connect";
import { Variant } from "../types";
import { Switch } from "./switch";

/**
 * Code Connect for Switch.
 *
 * Validated on the Professional plan via `npx figma connect parse`. File key lives
 * once in figma.config.json (`documentUrlSubstitutions`), not here.
 *
 * Contract: `Variant=primary` ↔ `variant="primary"`. The Figma `State` axis carries
 * the boolean model — `on` → `checked={true}`, `off`/`disabled` → `checked={false}`;
 * `disabled` → `disabled={true}`. Hover/focus (the appearing-outline ring) is
 * prototype interactivity, not an axis.
 */
figma.connect(Switch, "<SEMIO_UI_LIBRARY>?node-id=507-917", {
  props: {
    variant: figma.enum("Variant", {
      default: Variant.Default,
      primary: Variant.Primary,
      secondary: Variant.Secondary,
      tertiary: Variant.Tertiary,
      error: Variant.Error,
    }),
    // The disabled variant is drawn in the on state (dimmed) — matching the
    // Disabled story — so disabled maps to checked=true.
    checked: figma.enum("State", { on: true, off: false, disabled: true }),
    disabled: figma.enum("State", { disabled: true, on: false, off: false }),
  },
  example: ({ variant, checked, disabled }) => (
    <Switch variant={variant} checked={checked} disabled={disabled} onCheckedChange={() => {}} />
  ),
});
