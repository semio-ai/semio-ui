import figma from "@figma/code-connect";
import { Label } from "./label";

/**
 * Code Connect for Label — the form-field label (label text + optional message).
 * Validated on Professional via `npx figma connect parse`. `Show message` gates the
 * `message`; `children` (the wrapped input) is contextual, shown as a placeholder.
 */
figma.connect(Label, "<SEMIO_UI_LIBRARY>?node-id=583-812", {
  props: {
    label: figma.string("Label"),
    message: figma.boolean("Show message", { true: figma.string("Message"), false: undefined }),
  },
  example: ({ label, message }) => (
    <Label label={label} message={message}>
      <span />
    </Label>
  ),
});
