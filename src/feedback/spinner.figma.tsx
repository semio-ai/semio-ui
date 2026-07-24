import figma from "@figma/code-connect";
import { Spinner } from "./spinner";

/**
 * Code Connect for Spinner.
 *
 * Spinner has no props (an animated ring; optional `children` to spin). The Figma
 * component is a static representation of the resting ring — animation can't be
 * mirrored — so there's no variant/token parity to check, only this drop-in.
 * Validated via `npx figma connect parse`.
 */
figma.connect(Spinner, "<SEMIO_UI_LIBRARY>?node-id=545-706", {
  example: () => <Spinner />,
});
