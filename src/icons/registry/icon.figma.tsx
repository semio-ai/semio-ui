import figma from "@figma/code-connect";
import { Icon } from "./icon";

/**
 * Code Connect for the icon system.
 *
 * One representative glyph is mapped here to prove the loop — the contract is
 * `registry key == Figma component name (Icon/<key>) == <Icon name="<key>" />`.
 * The full set is generated from figma/icon-manifest.json in the
 * rollout (STUDIO-65/70), rather than hand-written. Node = Icon/box on the
 * 🔣 Icons page.
 */
figma.connect(Icon, "<SEMIO_UI_LIBRARY>?node-id=145-40", {
  example: () => <Icon name="box" />,
});
