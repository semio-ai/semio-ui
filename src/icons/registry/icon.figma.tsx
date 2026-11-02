import figma from "@figma/code-connect";
import { Icon } from "./icon";

/**
 * Code Connect for the icon system.
 *
 * The representative Icon/box mapping follows the ui manifest's contract:
 * `registry key == Figma component name (Icon/<key>) == <Icon name="<key>" />`.
 * Other generic icon mappings are generated from figma/icon-manifest.json
 * rather than hand-written. This node is Icon/box on the Icons page.
 */
figma.connect(Icon, "<SEMIO_UI_LIBRARY>?node-id=145-40", {
  example: () => <Icon name="box" />,
});
