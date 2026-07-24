import figma from "@figma/code-connect";
import { Variant } from "../types";
import { Dialog } from "./dialog";

/**
 * Code Connect for Dialog — the confirmation-dialog chrome (header + full-width
 * split footer), sharing Modal's card visual language but with distinct
 * AlertDialog confirmation semantics. Promoted to a real component for the same
 * reason as Modal: a fixed, content-agnostic shell.
 *
 * `Variant=error` ↔ `variant` (the destructive-confirm case). `Title` → `title`.
 * `Show description` gates the subtitle/message. Body is optional in code; the
 * confirmation-only form is the default. Handlers are runtime.
 */
figma.connect(Dialog, "<SEMIO_UI_LIBRARY>?node-id=600-1495", {
  props: {
    title: figma.string("Title"),
    variant: figma.enum("Variant", {
      default: Variant.Default,
      primary: Variant.Primary,
      error: Variant.Error,
    }),
    description: figma.boolean("Show description", {
      true: "This cannot be undone.",
      false: undefined,
    }),
  },
  example: ({ title, variant, description }) => (
    <Dialog
      open
      title={title}
      description={description}
      variant={variant}
      onStateChange={() => undefined}
      onSubmit={() => undefined}
      onCancel={() => undefined}
    />
  ),
});
