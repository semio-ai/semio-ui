import figma from "@figma/code-connect";
import { Variant } from "../types";
import { TextField } from "./text-field";

/**
 * Code Connect for TextField.
 *
 * Validated on the Professional plan via `npx figma connect parse` (only
 * `figma connect publish` is Organization/Enterprise-gated), so this is a
 * literal drop-in once the plan upgrades — no rework. The Figma file key lives
 * once in figma.config.json (`documentUrlSubstitutions`), not here.
 *
 * Contract: each Figma variant option name equals the code prop value
 * (`Outline=interact` ↔ `outline="interact"`, `Variant=primary` ↔
 * `variant="primary"`), mirroring the Button + icon contracts. The clear-button
 * (`onClear`) is modeled in Figma as intrinsic to the focus state, not a prop.
 */
figma.connect(TextField, "<SEMIO_UI_LIBRARY>?node-id=496-628", {
  props: {
    placeholder: figma.string("Placeholder"),
    outline: figma.enum("Outline", {
      interact: "interact",
      always: "always",
      hidden: "hidden",
    }),
    variant: figma.enum("Variant", {
      default: Variant.Default,
      primary: Variant.Primary,
      secondary: Variant.Secondary,
      tertiary: Variant.Tertiary,
      error: Variant.Error,
    }),
    // "Show icon" gates the instance-swap glyph — the swapped Icon/<key>
    // renders via its own Code Connect (see icon.figma.tsx).
    icon: figma.boolean("Show icon", {
      true: figma.instance("Icon left"),
      false: undefined,
    }),
    // State carries the appearing-outline interaction (hover/focus) + the disabled
    // prop; hover/focus aren't code props, so only disabled maps.
    disabled: figma.enum("State", { disabled: true, default: false, hover: false, focus: false }),
  },
  example: ({ placeholder, outline, variant, icon, disabled }) => (
    <TextField placeholder={placeholder} outline={outline} variant={variant} icon={icon} disabled={disabled} />
  ),
});
