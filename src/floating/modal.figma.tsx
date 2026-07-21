import figma from "@figma/code-connect";
import { Variant } from "../types";
import { Modal } from "./modal";

/**
 * Code Connect for Modal — the standardized card chrome (header + body slot +
 * footer). Unlike the dropdown/select containers (which are compositions of
 * already-componentized rows and stay as Figma examples), the Modal shell is
 * fixed and content-agnostic, so it's a real component.
 *
 * `Variant=primary` ↔ `variant`. `Title` → `title`. `Show description` gates the
 * subtitle (mapped to an illustrative string). `open`/`onStateChange`/`onSubmit`/
 * `onCancel` are runtime; the footer/cancel toggles are Figma-side layout knobs.
 */
figma.connect(Modal, "<SEMIO_UI_LIBRARY>?node-id=600-1375", {
  props: {
    title: figma.string("Title"),
    variant: figma.enum("Variant", {
      default: Variant.Default,
      primary: Variant.Primary,
      error: Variant.Error,
    }),
    description: figma.boolean("Show description", {
      true: "Modal description",
      false: undefined,
    }),
  },
  example: ({ title, variant, description }) => (
    <Modal
      open
      title={title}
      description={description}
      variant={variant}
      onStateChange={() => undefined}
      onSubmit={() => undefined}
      onCancel={() => undefined}
    >
      <span />
    </Modal>
  ),
});
