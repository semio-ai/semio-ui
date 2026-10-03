import figma from "@figma/code-connect";
import { Variant } from "../types";
import { ToggleSquare } from "./toggle-square";

/**
 * Code Connect for ToggleSquare.
 *
 * Validated on the Professional plan via `npx figma connect parse`. File key lives
 * once in figma.config.json (`documentUrlSubstitutions`), not here.
 *
 * Contract: `Variant=primary` ↔ `variant="primary"`. The Figma `State` axis carries
 * the tri-state `value` model — `on` → `true`, `off` → `false`, `partial` →
 * `"partial"`, and `disabled` maps to the `disabled` prop. The `Icon` instance-swap
 * is the `children` glyph. Hover/focus ring is prototype interactivity, not an axis.
 */
figma.connect(ToggleSquare, "<SEMIO_UI_LIBRARY>?node-id=508-997", {
  props: {
    variant: figma.enum("Variant", {
      default: Variant.Default,
      primary: Variant.Primary,
      secondary: Variant.Secondary,
      tertiary: Variant.Tertiary,
      error: Variant.Error,
    }),
    // The disabled variant is drawn in the on state (dimmed) — matching the
    // Disabled story — so disabled maps to value=true.
    value: figma.enum("State", { on: true, off: false, partial: "partial", disabled: true }),
    disabled: figma.enum("State", { disabled: true, on: false, off: false, partial: false }),
    children: figma.instance("Icon"),
  },
  example: ({ variant, value, disabled, children }) => (
    <ToggleSquare variant={variant} value={value} disabled={disabled} onChange={() => {}}>
      {children}
    </ToggleSquare>
  ),
});
